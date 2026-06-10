package checkout

type CheckoutSessionRequest struct {
	PlanID      string      `json:"plan_id" binding:"required"`
	BillingType BillingType `json:"billingType" binding:"required"`
	ChargeType  ChargeType  `json:"chargeType" binding:"required"`
}

type AuthContext struct {
	UserID    string
	CompanyID string
	Role      string
	Status    string
}

type CreateCheckoutSessionInput struct {
	PlanID           string
	BillingType      BillingType
	ChargeType       ChargeType
	Auth             AuthContext
	DueDateLimitDays int32
}

type BillingType string

const (
	BillingTypeUndefined  BillingType = "UNDEFINED"
	BillingTypeBoleto     BillingType = "BOLETO"
	BillingTypeCreditCard BillingType = "CREDIT_CARD"
	BillingTypePix        BillingType = "PIX"
)

type ChargeType string

const (
	ChargeTypeDetached    ChargeType = "DETACHED"
	ChargeTypeRecurrent   ChargeType = "RECURRENT"
	ChargeTypeInstallment ChargeType = "INSTALLMENT"
)

type CreatePaymentLink struct {
	Name              string      `json:"name"`
	Value             float64     `json:"value"`
	BillingType       BillingType `json:"billingType"`
	ChargeType        ChargeType  `json:"chargeType"`
	ExternalReference string      `json:"externalReference,omitempty"`
	DueDateLimitDays  int32       `json:"dueDateLimitDays"`
}
type PaymentLinkResponse struct {
	ID               string  `json:"id"`
	Name             string  `json:"name"`
	URL              string  `json:"url"`
	Description      string  `json:"description"`
	Value            float64 `json:"value"`
	BillingType      string  `json:"billingType"`
	ChargeType       string  `json:"chargeType"`
	DueDateLimitDays int32   `json:"dueDateLimitDays"`
}
type CheckoutSessionResponse struct {
	CheckoutSessionID string `json:"checkout_session_id"`
	CheckoutURL       string `json:"checkout_url"`
	Status            string `json:"status"`
	AmountCents       int    `json:"amount_cents"`
	Currency          string `json:"currency"`
}
