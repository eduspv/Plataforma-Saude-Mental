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
