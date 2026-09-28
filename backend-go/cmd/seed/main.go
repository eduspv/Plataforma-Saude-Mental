// cmd/seed/main.go
//
// Seed de desenvolvimento: cria DUAS empresas ATIVAS, cada uma com admin +
// subscription ativa + um colaborador ATIVO, para permitir testar login e
// diagnóstico sem depender do fluxo de pagamento (Asaas/webhook).
//
// Rodar:  go run ./cmd/seed
//
// NÃO usar em produção — cria dados fixos de teste.

package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"backend-go/internal/audit"
	"backend-go/internal/auth"
	"backend-go/internal/companies"
	"backend-go/internal/config"
	"backend-go/internal/database"
	"backend-go/internal/plans"
	"backend-go/internal/subscriptions"
	"backend-go/internal/users"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// ─────────────────────────────────────────────────────────────
// DADOS DO SEED — anote isto, é o que você vai usar pra logar.
// As senhas de cada empresa ficam aqui; nunca são impressas no console.
// ─────────────────────────────────────────────────────────────

type companySpec struct {
	companyName  string
	companyCNPJ  string
	companyEmail string
	companyPhone string

	adminName     string
	adminEmail    string
	adminPassword string

	employeeName     string
	employeeEmail    string
	employeeCPF      string
	employeePassword string
}

var companySpecs = []companySpec{
	{
		companyName:  "Empresa Seed LTDA",
		companyCNPJ:  "11222333000181", // CNPJ com dígito verificador válido
		companyEmail: "empresa.seed@teste.com",
		companyPhone: "11999990000",

		adminName:     "Admin Seed",
		adminEmail:    "admin.seed@teste.com",
		adminPassword: "Seed@1234", // senha forte (maiúscula, minúscula, número, especial, 8+)

		employeeName:     "Colaborador Seed",
		employeeEmail:    "colaborador.seed@teste.com",
		employeeCPF:      "52998224725", // CPF com dígito verificador válido
		employeePassword: "Seed@1234",
	},
	{
		companyName:  "Empresa Seed 2 LTDA",
		companyCNPJ:  "10000000000145", // CNPJ com dígito verificador válido
		companyEmail: "empresa.seed2@teste.com",
		companyPhone: "11999990001",

		adminName:     "Admin Seed 2",
		adminEmail:    "admin.seed2@teste.com",
		adminPassword: "Seed@1234",

		employeeName:     "Colaborador Seed 2",
		employeeEmail:    "colaborador.seed2@teste.com",
		employeeCPF:      "10000000019", // CPF com dígito verificador válido
		employeePassword: "Seed@1234",
	},
}

func main() {
	ctx := context.Background()

	// 1. Conecta no banco (mesmo jeito do cmd/server/main.go)
	cfg := config.LoadConfig()
	db := database.Connect(cfg.DatabaseURL)
	defer db.Close()

	log.Println("[SEED] conectado ao banco")

	if err := seedDiagnosticQuestions(ctx, db); err != nil {
		log.Fatalf("seed diagnóstico falhou: %v", err)
	}

	// 2. Precisamos de um plano existente pra vincular as subscriptions.
	plansRepo := plans.NewRepository(db)
	activePlans, err := plansRepo.ListActivePlans(ctx)
	if err != nil {
		log.Fatalf("[SEED] erro ao listar planos: %v", err)
	}
	if len(activePlans) == 0 {
		log.Fatal("[SEED] nenhum plano ativo encontrado — rode o INSERT de planos antes")
	}
	plan := activePlans[0] // pega o primeiro plano ativo
	log.Printf("[SEED] usando plano: %s (%s)", plan.Name, plan.ID)

	authRepo := auth.NewRepository(db)
	subsRepo := subscriptions.NewRepository(db)
	usersRepo := users.NewRepository(db)
	auditService := audit.NewService(audit.NewRepository(db))
	usersService := users.NewService(usersRepo, subsRepo, plansRepo, auditService)

	for _, spec := range companySpecs {
		if err := seedCompany(ctx, db, spec, plan.ID, authRepo, subsRepo, usersService); err != nil {
			log.Fatalf("[SEED] erro ao criar empresa %q: %v", spec.companyName, err)
		}
	}

	fmt.Println("\n─────────────────────────────────────────")
	fmt.Println(" SEED CONCLUÍDO — empresas de teste criadas:")
	for _, spec := range companySpecs {
		fmt.Printf("  Empresa:     %s\n", spec.companyName)
		fmt.Printf("  Admin:       %s\n", spec.adminEmail)
		fmt.Printf("  Colaborador: %s\n", spec.employeeEmail)
	}
	fmt.Println(" Senhas: consulte as constantes em cmd/seed/main.go (não impressas aqui).")
	fmt.Println("─────────────────────────────────────────")
}

// seedCompany cria uma empresa completa: empresa+admin, subscription ativa
// e colaborador, a partir de uma companySpec.
func seedCompany(
	ctx context.Context,
	db *pgxpool.Pool,
	spec companySpec,
	planID string,
	authRepo *auth.Repository,
	subsRepo *subscriptions.Repository,
	usersService *users.Service,
) error {
	now := time.Now()

	// 1. Monta a empresa e o admin JÁ com status active (pula validação/Asaas).
	company := companies.Company{
		Name:           spec.companyName,
		CNPJ:           spec.companyCNPJ,
		CorporateEmail: spec.companyEmail,
		Phone:          spec.companyPhone,
		Status:         companies.CompanyStatusActive,
	}

	adminHash, err := hashPassword(spec.adminPassword)
	if err != nil {
		return fmt.Errorf("hashear senha do admin: %w", err)
	}
	admin := users.User{
		Name:                    spec.adminName,
		Email:                   spec.adminEmail,
		PasswordHash:            adminHash,
		Role:                    "COMPANY_ADMIN",
		Status:                  users.UserStatusActive,
		Phone:                   spec.companyPhone,
		AcceptedTerms:           true,
		AcceptedTermsAt:         &now,
		AcceptedPrivacyPolicy:   true,
		AcceptedPrivacyPolicyAt: &now,
	}

	// 2. Cria empresa + admin (transacional, dentro do próprio repo).
	registerResp, err := authRepo.CreateCompanyAndUser(company, admin)
	if err != nil {
		return fmt.Errorf("criar empresa+admin: %w", err)
	}
	companyID := registerResp.CompanyID
	log.Printf("[SEED] empresa %q criada (company_id = %s)", spec.companyName, companyID)

	// 3. Cria a subscription ATIVA (sem pagamento), satisfazendo o IsPlanActive.
	tx, err := db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("abrir transação da subscription: %w", err)
	}
	_, err = subsRepo.CreateTx(ctx, tx, subscriptions.CreateSubscriptionInput{
		CompanyID:          companyID,
		PlanID:             planID,
		LastPaymentID:      nil,
		Provider:           nil,
		CurrentPeriodStart: now,
		CurrentPeriodEnd:   now.AddDate(0, 1, 0), // +1 mês, no futuro
	})
	if err != nil {
		tx.Rollback(ctx)
		return fmt.Errorf("criar subscription: %w", err)
	}
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commitar subscription: %w", err)
	}
	log.Printf("[SEED] subscription ATIVA criada para %q", spec.companyName)

	// 4. Agora sim, cria o colaborador via service real (exige subscription ativa).
	_, err = usersService.RegisterNewEmployee(&users.UserInput{
		Req: users.NewEmployeeRequest{
			Name:                  spec.employeeName,
			Email:                 spec.employeeEmail,
			Cpf:                   spec.employeeCPF,
			Password:              spec.employeePassword,
			AcceptedTerms:         true,
			AcceptedPrivacyPolicy: true,
		},
		Auth: users.AuthContext{
			CompanyID: companyID,
			Role:      "COMPANY_ADMIN", // quem "cria" o colaborador — não pode ser EMPLOYEE
			Status:    users.UserStatusActive,
		},
	})
	if err != nil {
		return fmt.Errorf("criar colaborador: %w", err)
	}
	log.Printf("[SEED] colaborador ATIVO criado para %q", spec.companyName)

	return nil
}

func seedDiagnosticQuestions(ctx context.Context, db *pgxpool.Pool) error {
	// Guard de idempotência: se já houver perguntas, não duplica ao rodar de novo.
	var count int
	if err := db.QueryRow(ctx, `SELECT COUNT(*) FROM diagnostic_questions`).Scan(&count); err != nil {
		return fmt.Errorf("contar perguntas do diagnóstico: %w", err)
	}
	if count > 0 {
		log.Printf("seed diagnóstico: %d perguntas já existem, pulando.", count)
		return nil
	}

	type seedQuestion struct {
		step       int
		text       string
		qType      string
		options    any // string JSON para multiple_choice, nil para os demais
		weight     int
		isCritical bool
		order      int
	}

	// ValidateAnswers/scoring só implementa scale_1_5 hoje (yes_no e
	// multiple_choice estão comentados no service, são backlog) — por
	// isso todas as perguntas do seed são scale_1_5, senão o submit
	// completo estoura 500 ao validar as perguntas dos outros tipos.
	questions := []seedQuestion{
		{1, "Com que frequência você tem se sentido sobrecarregado(a) no trabalho?", "scale_1_5", nil, 2, false, 1},
		{2, "Como você avalia a qualidade do seu sono nas últimas semanas?", "scale_1_5", nil, 2, false, 1},
		{3, "Em uma escala de 1 a 5, o quanto você tem tido pensamentos que te causam sofrimento e preocupação?", "scale_1_5", nil, 3, true, 1},
		{4, "Em uma escala de 1 a 5, com que frequência você consegue se desconectar do trabalho no tempo livre?", "scale_1_5", nil, 1, false, 1},
		{5, "No geral, como você tem se sentido em relação ao seu bem-estar emocional?", "scale_1_5", nil, 2, false, 1},
	}

	const insert = `
		INSERT INTO diagnostic_questions
			(form_version, step, question_text, type, options, weight, is_critical, is_active, display_order)
		VALUES
			(1, $1, $2, $3, $4::jsonb, $5, $6, TRUE, $7)`

	for _, q := range questions {
		if _, err := db.Exec(ctx, insert,
			q.step, q.text, q.qType, q.options, q.weight, q.isCritical, q.order,
		); err != nil {
			return fmt.Errorf("inserir pergunta (step %d): %w", q.step, err)
		}
	}

	log.Printf("seed diagnóstico: %d perguntas inseridas (form_version=1).", len(questions))
	return nil
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}
