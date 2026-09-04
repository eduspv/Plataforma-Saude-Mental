// cmd/seed/main.go
//
// Seed de desenvolvimento: cria uma empresa ATIVA + admin + subscription ativa
// + um colaborador ATIVO, para permitir testar login e diagnóstico sem depender
// do fluxo de pagamento (Asaas/webhook).
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
// ─────────────────────────────────────────────────────────────
const (
	companyName  = "Empresa Seed LTDA"
	companyCNPJ  = "11222333000181" // CNPJ com dígito verificador válido
	companyEmail = "empresa.seed@teste.com"
	companyPhone = "11999990000"

	adminName     = "Admin Seed"
	adminEmail    = "admin.seed@teste.com"
	adminPassword = "Seed@1234" // senha forte (maiúscula, minúscula, número, especial, 8+)

	employeeName     = "Colaborador Seed"
	employeeEmail    = "colaborador.seed@teste.com"
	employeeCPF      = "52998224725" // CPF com dígito verificador válido
	employeePassword = "Seed@1234"
)

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

	// 2. Precisamos de um plano existente pra vincular a subscription.
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

	// 3. Monta a empresa e o admin JÁ com status active (pula validação/Asaas).
	now := time.Now()
	company := companies.Company{
		Name:           companyName,
		CNPJ:           companyCNPJ,
		CorporateEmail: companyEmail,
		Phone:          companyPhone,
		Status:         companies.CompanyStatusActive,
	}

	adminHash, err := hashPassword(adminPassword)
	if err != nil {
		log.Fatalf("[SEED] erro ao hashear senha do admin: %v", err)
	}
	admin := users.User{
		Name:                    adminName,
		Email:                   adminEmail,
		PasswordHash:            adminHash,
		Role:                    "COMPANY_ADMIN",
		Status:                  users.UserStatusActive,
		Phone:                   companyPhone,
		AcceptedTerms:           true,
		AcceptedTermsAt:         &now,
		AcceptedPrivacyPolicy:   true,
		AcceptedPrivacyPolicyAt: &now,
	}

	// 4. Cria empresa + admin (transacional, dentro do próprio repo).
	authRepo := auth.NewRepository(db)
	_, err = authRepo.CreateCompanyAndUser(company, admin)
	if err != nil {
		log.Fatalf("[SEED] erro ao criar empresa+admin: %v", err)
	}
	log.Println("[SEED] empresa + admin criados")

	// 5. Recupera o company_id recém-criado (pelo CNPJ, que é único).
	companyID, err := getCompanyIDByCNPJ(ctx, db, companyCNPJ)
	if err != nil {
		log.Fatalf("[SEED] erro ao buscar company_id: %v", err)
	}
	log.Printf("[SEED] company_id = %s", companyID)

	// 6. Cria a subscription ATIVA (sem pagamento), satisfazendo o IsPlanActive.
	tx, err := db.Begin(ctx)
	if err != nil {
		log.Fatalf("[SEED] erro ao abrir transação: %v", err)
	}
	subsRepo := subscriptions.NewRepository(db)
	_, err = subsRepo.CreateTx(ctx, tx, subscriptions.CreateSubscriptionInput{
		CompanyID:          companyID,
		PlanID:             plan.ID,
		LastPaymentID:      nil,
		Provider:           nil,
		CurrentPeriodStart: now,
		CurrentPeriodEnd:   now.AddDate(0, 1, 0), // +1 mês, no futuro
	})
	if err != nil {
		tx.Rollback(ctx)
		log.Fatalf("[SEED] erro ao criar subscription: %v", err)
	}
	if err := tx.Commit(ctx); err != nil {
		log.Fatalf("[SEED] erro ao commitar subscription: %v", err)
	}
	log.Println("[SEED] subscription ATIVA criada")

	// 7. Agora sim, cria o colaborador via service real (exige subscription ativa).
	usersRepo := users.NewRepository(db)
	auditService := audit.NewService(audit.NewRepository(db))
	usersService := users.NewService(usersRepo, subsRepo, plansRepo, auditService)
	_, err = usersService.RegisterNewEmployee(&users.UserInput{
		Req: users.NewEmployeeRequest{
			Name:                  employeeName,
			Email:                 employeeEmail,
			Cpf:                   employeeCPF,
			Password:              employeePassword,
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
		log.Fatalf("[SEED] erro ao criar colaborador: %v", err)
	}
	log.Println("[SEED] colaborador ATIVO criado")

	fmt.Println("\n─────────────────────────────────────────")
	fmt.Println(" SEED CONCLUÍDO — credenciais pra login:")
	fmt.Printf("  Admin:       %s / %s\n", adminEmail, adminPassword)
	fmt.Printf("  Colaborador: %s / %s\n", employeeEmail, employeePassword)
	fmt.Println("─────────────────────────────────────────")
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

// adicione ao seed, e o import "golang.org/x/crypto/bcrypt"
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func getCompanyIDByCNPJ(ctx context.Context, db *pgxpool.Pool, cnpj string) (string, error) {
	// precisa import "github.com/jackc/pgx/v5/pgxpool"
	var id string
	err := db.QueryRow(ctx, `SELECT id FROM companies WHERE cnpj = $1`, cnpj).Scan(&id)
	return id, err
}
