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

type PaymentLinksListResponse struct {
	Object     string                `json:"object"`
	HasMore    bool                  `json:"hasMore"`
	TotalCount int                   `json:"totalCount"`
	Limit      int                   `json:"limit"`
	Offset     int                   `json:"offset"`
	Data       []PaymentLinkResponse `json:"data"`
}

type PaymentLinkDataResponse struct {
	ID                  string  `json:"id"`
	Name                string  `json:"name"`
	Value               float64 `json:"value"`
	Active              bool    `json:"active"`
	ChargeType          string  `json:"chargeType"`
	URL                 string  `json:"url"`
	BillingType         string  `json:"billingType"`
	SubscriptionCycle   string  `json:"subscriptionCycle"`
	Description         string  `json:"description"`
	EndDate             string  `json:"endDate"`
	Deleted             bool    `json:"deleted"`
	ViewCount           int     `json:"viewCount"`
	MaxInstallmentCount int     `json:"maxInstallmentCount"`
	DueDateLimitDays    int     `json:"dueDateLimitDays"`
	NotificationEnabled bool    `json:"notificationEnabled"`
	IsAddressRequired   bool    `json:"isAddressRequired"`
	ExternalReference   string  `json:"externalReference"`
}
