package router_test

import (
	"net/http"
	"testing"

	"backend-go/internal/users"
)

// TestSmoke_CompaniesMe prova que o harness funciona de ponta a ponta:
// migrations rodaram, o seed criou a Empresa A com um admin ativo, e o
// router protege /api/v1/companies/me exigindo um token válido.
func TestSmoke_CompaniesMe(t *testing.T) {
	if len(testCompany) == 0 {
		t.Fatal("seed não retornou nenhuma empresa — harness não inicializou corretamente")
	}
	companyA := testCompany[0]

	t.Run("sem token retorna 401", func(t *testing.T) {
		status, _ := doRequest(t, "GET", "/api/v1/companies/me", "", nil)
		if status != http.StatusUnauthorized {
			t.Fatalf("esperava 401, obteve %d", status)
		}
	})

	t.Run("com token válido de admin retorna 200", func(t *testing.T) {
		token := genToken(t, companyA.AdminID, companyA.CompanyID, "COMPANY_ADMIN", users.UserStatusActive)

		status, body := doRequest(t, "GET", "/api/v1/companies/me", token, nil)
		if status != http.StatusOK {
			t.Fatalf("esperava 200, obteve %d — body: %s", status, body)
		}
	})
}
