package companies

import "time"

type CompanyProfileResponse struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Status   string `json:"status"`
	Cnpj     string `json:"cnpj"`
	Telefone string `json:"telefone"`
}

type CompanyPlanDashboardResponse struct {
	Name          string `json:"name"`
	MaxEmployees  int    `json:"max_employees"`
	PriceCents    int    `json:"price_cents"`
	Currency      string `json:"currency"`
	BillingCycle  string `json:"billing_cycle"`
	PaymentMethod string `json:"payment_method"`
	UsersAmount   int    `json:"users_amount"`

	// TODO: implementar status da assinatura
	// TODO: definir lógica do próximo vencimento
}

type PaymentHistoryResponse struct {
	Summary  Summary    `json:"summary"`
	Payments []Payments `json:"payments"`
}

type Summary struct {
	TotalPaidCents         int        `json:"total_paid_cents"`
	Currency               string     `json:"currency"`
	CurrentPlanAmountCents int        `json:"current_plan_amount_cents"`
	PaymentMethod          string     `json:"payment_method"`
	NextDueDate            *time.Time `json:"next_due_date"`
}

type Payments struct {
	ID            string    `json:"id"`
	DueDate       time.Time `json:"due_date"`
	PaidAt        time.Time `json:"paid_at"`
	AmountCents   int       `json:"amount_cents"`
	Currency      string    `json:"currency"`
	PaymentMethod string    `json:"payment_method"`
	Status        string    `json:"status"`
}
