package plans

type AllPlansResponse struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	PriceCents   int      `json:"price_cents"`
	Currency     string   `json:"currency"`
	BillingCycle string   `json:"billing_cycle"`
	MaxEmployees int      `json:"max_employees"`
	Features     []string `json:"features"`
}

type PlanDashboardData struct {
	Name         string
	MaxEmployees int
	PriceCents   int
	Currency     string
	BillingCycle string
	//precisa ainda fazer a logica em outra struct na resposta de forma de pagamento e do status
	//TODO: Descobrir como vou fazer o proximo vencimento
}
