// Harness de teste de integração HTTP (S1-00c).
//
// Sobe o schema (migrations), garante um plano de teste ativo, roda o seed
// (duas empresas completas) e monta o router real em memória via
// router.SetupRouter — tudo UMA vez em TestMain, reaproveitado pelos testes.
//
// O banco de teste é externo (container já no ar, ex.: porta 5433) e é
// informado via TEST_DATABASE_URL. Sem essa variável, os testes falham
// alto e claro em vez de arriscar rodar contra o banco de desenvolvimento.
package router_test

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http/httptest"
	"os"
	"testing"

	"backend-go/internal/database"
	"backend-go/internal/migrations"
	"backend-go/internal/router"
	"backend-go/internal/seed"
	"backend-go/internal/shared/security"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

// testJWTSecret é usado tanto para montar o router quanto para gerar os
// tokens nos testes — precisa ser o mesmo dos dois lados.
const testJWTSecret = "test-jwt-secret-s1-00c"

var (
	testDB      *pgxpool.Pool
	testEngine  *gin.Engine
	testCompany []seed.CompanyResult // resultado do seed, uma entrada por empresa
)

func TestMain(m *testing.M) {
	dbURL := os.Getenv("TEST_DATABASE_URL")
	if dbURL == "" {
		fmt.Fprintln(os.Stderr, "TEST_DATABASE_URL não definida — defina TEST_DATABASE_URL apontando para o banco de teste (ex.: container na porta 5433) antes de rodar os testes de integração.")
		os.Exit(1)
	}

	gin.SetMode(gin.TestMode)

	if err := migrations.Up(dbURL); err != nil {
		fmt.Fprintf(os.Stderr, "falha ao rodar migrations no banco de teste: %v\n", err)
		os.Exit(1)
	}

	testDB = database.Connect(dbURL)
	defer testDB.Close()

	ctx := context.Background()

	if err := ensureTestPlan(ctx, testDB); err != nil {
		fmt.Fprintf(os.Stderr, "falha ao garantir plano de teste: %v\n", err)
		os.Exit(1)
	}

	results, err := seed.Run(ctx, testDB)
	if err != nil {
		fmt.Fprintf(os.Stderr, "falha ao rodar seed no banco de teste: %v\n", err)
		os.Exit(1)
	}
	testCompany = results

	testEngine = router.SetupRouter(testDB, testJWTSecret, "dummy", "dummy")

	os.Exit(m.Run())
}

// ensureTestPlan garante que existe ao menos um plano ativo no banco de
// teste — o seed depende disso (A-13) e o banco de teste começa limpo.
// Idempotente: se o plano já existe (nome único), não faz nada.
func ensureTestPlan(ctx context.Context, db *pgxpool.Pool) error {
	const insert = `
		INSERT INTO plans (name, description, price_cents, currency, due_date_limit_days, billing_cycle, max_employees, is_active)
		VALUES ('Plano Teste Integração', 'Plano criado pelo harness de teste de integração', 1000, 'BRL', 1, 'monthly', 50, TRUE)
		ON CONFLICT (name) DO NOTHING`

	_, err := db.Exec(ctx, insert)
	return err
}

// genToken gera um JWT válido para o router de teste (mesmo jwtSecret).
func genToken(t *testing.T, userID, companyID, role, status string) string {
	t.Helper()

	token, err := security.GenerateJWT(testJWTSecret, userID, companyID, role, status)
	if err != nil {
		t.Fatalf("gerar token de teste: %v", err)
	}
	return token
}

// doRequest faz uma requisição HTTP contra o router de teste via
// httptest, sem abrir porta. token e body são opcionais (string vazia /
// nil).
func doRequest(t *testing.T, method, path, token string, body []byte) (int, []byte) {
	t.Helper()

	req := httptest.NewRequest(method, path, bytes.NewReader(body))
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	w := httptest.NewRecorder()
	testEngine.ServeHTTP(w, req)

	respBody, err := io.ReadAll(w.Result().Body)
	if err != nil {
		t.Fatalf("ler corpo da resposta: %v", err)
	}

	return w.Code, respBody
}
