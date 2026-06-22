package companies

import "time"

const (
	CompanyStatusPendingPlanSelection = "pending_plan_selection"
	CompanyStatusPendingPayment       = "pending_payment"
	CompanyStatusActive               = "active"
	CompanyStatusBlocked              = "blocked"
	CompanyStatusInactive             = "inactive"
)

type Company struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	CNPJ            string    `json:"cnpj"`
	CorporateEmail  string    `json:"corporate_email"`
	Phone           string    `json:"phone"`
	Status          string    `json:"status"`
	AsaasCustomerID *string   `json:"asaas_customer_id"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
