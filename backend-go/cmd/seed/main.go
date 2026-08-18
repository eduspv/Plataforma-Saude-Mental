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
	usersService := users.NewService(usersRepo, subsRepo, plansRepo)
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
