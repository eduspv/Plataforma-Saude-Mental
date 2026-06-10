package checkout

import (
	"backend-go/internal/plans"
	"time"
)

const (
	CheckoutProviderAsaas = "ASAAS"

	CheckoutStatusPending   = "pending"
	CheckoutStatusPaid      = "paid"
	CheckoutStatusExpired   = "expired"
	CheckoutStatusCancelled = "cancelled"
	CheckoutStatusFailed    = "failed"
)

type CheckoutSession struct {
	ID                string
	UserID            string
	CompanyID         string
	PlanID            string
	Provider          string
	ProviderSessionID *string
	BillingType       BillingType
	ChargeType        ChargeType
	Status            string
	AmountCents       int
	Currency          string
	CheckoutURL       *string
	ExpiresAt         *time.Time
	PaidAt            *time.Time
	FailedAt          *time.Time
	FailureReason     *string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

type Checkout func(CreateCheckoutSessionInput, *plans.Plan)

type CHeckoutBillingTypes struct {
	BillingMethods map[BillingType]Checkout
}
