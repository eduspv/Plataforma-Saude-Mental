package subscriptions

import "time"

type Subscription struct {
	ID                     string
	CompanyID              string
	PlanID                 string
	LastPaymentID          *string
	Provider               *string
	ProviderSubscriptionID *string
	Status                 SubscriptionStatus
	StartedAt              time.Time
	CurrentPeriodStart     *time.Time
	CurrentPeriodEnd       *time.Time
	CancelledAt            *time.Time
	EndedAt                *time.Time
	CreatedAt              time.Time
	UpdatedAt              time.Time
}

type SubscriptionStatus string

const (
	SubscriptionStatusActive    SubscriptionStatus = "active"
	SubscriptionStatusPastDue   SubscriptionStatus = "past_due"
	SubscriptionStatusCancelled SubscriptionStatus = "cancelled"
	SubscriptionStatusExpired   SubscriptionStatus = "expired"
	SubscriptionStatusInactive  SubscriptionStatus = "inactive"
)

type ActivateFromPaymentInput struct {
	CompanyID string
	PlanID    string
	PaymentID string
}

// periodEndCalculator é o tipo função que toda variante de ciclo segue:
// dado o início do período, devolve o fim.
type periodEndCalculator func(base time.Time) time.Time

// periodEndByCycle mapeia o billing_cycle do plano para a função que
// calcula o fim do período. Adicionar um ciclo novo é adicionar uma linha aqui.
var periodEndByCycle = map[string]periodEndCalculator{
	"monthly": func(base time.Time) time.Time { return base.AddDate(0, 1, 0) },
	"yearly":  func(base time.Time) time.Time { return base.AddDate(1, 0, 0) },
}
