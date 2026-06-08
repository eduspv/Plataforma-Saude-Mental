package plans

type Plan struct {
	ID           string
	Name         string
	Description  string
	PriceCents   int
	Currency     string
	BillingCycle string
	MaxEmployees *int
	IsActive     bool
}
