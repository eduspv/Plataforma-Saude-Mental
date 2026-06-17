package plans

type Plan struct {
	ID               string
	Name             string
	Description      string
	PriceCents       int
	Currency         string
	DueDateLimitDays int32
	BillingCycle     string
	MaxEmployees     *int
	IsActive         bool
}
