package plans

type Plan struct {
	ID              string
	Name            string
	Description     string
	PriceCents      int
	Currency        string
	DueDateTypeDays int32
	BillingCycle    string
	MaxEmployees    *int
	IsActive        bool
}
