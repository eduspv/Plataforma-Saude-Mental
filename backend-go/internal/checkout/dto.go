package checkout

type CheckoutSessionRequest struct {
	PlanID      string      `json:"plan_id" binding:"required"`
	BillingType BillingType `json:"billing_type" binding:"required"`
	ChargeType  ChargeType  `json:"charge_type" binding:"required"`

	// Campos opcionais, dependendo do método de pagamento
	DueDateLimitDays    *int              `json:"due_date_limit_days,omitempty"`
	MaxInstallmentCount *int              `json:"max_installment_count,omitempty"`
	SubscriptionCycle   SubscriptionCycle `json:"subscription_cycle,omitempty"`

	Description string `json:"description,omitempty"`
	EndDate     string `json:"end_date,omitempty"`

	IsAddressRequired   *bool `json:"is_address_required,omitempty"`
	NotificationEnabled *bool `json:"notification_enabled,omitempty"`
}

type AuthContext struct {
	UserID    string
	CompanyID string
	Role      string
	Status    string
}

type CreateCheckoutSessionInput struct {
	PlanID      string
	BillingType BillingType
	ChargeType  ChargeType
	Auth        AuthContext

	DueDateLimitDays    *int
	MaxInstallmentCount *int
	SubscriptionCycle   SubscriptionCycle

	Description string
	EndDate     string

	IsAddressRequired   *bool
	NotificationEnabled *bool
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

type SubscriptionCycle string

const (
	SubscriptionCycleMonthly SubscriptionCycle = "MONTHLY"
	SubscriptionCycleYearly  SubscriptionCycle = "YEARLY"
)

// Payload enviado para o Asaas
type CreatePaymentLink struct {
	Name        string  `json:"name"`
	Value       float64 `json:"value"`
	Description string  `json:"description,omitempty"`

	BillingType BillingType `json:"billingType"`
	ChargeType  ChargeType  `json:"chargeType"`

	ExternalReference string `json:"externalReference,omitempty"`

	DueDateLimitDays    *int              `json:"dueDateLimitDays,omitempty"`
	MaxInstallmentCount *int              `json:"maxInstallmentCount,omitempty"`
	SubscriptionCycle   SubscriptionCycle `json:"subscriptionCycle,omitempty"`

	EndDate string `json:"endDate,omitempty"`

	NotificationEnabled *bool `json:"notificationEnabled,omitempty"`
	IsAddressRequired   *bool `json:"isAddressRequired,omitempty"`
}

// Resposta de criação/listagem de link do Asaas
type PaymentLinkResponse struct {
	ID                  string            `json:"id"`
	Name                string            `json:"name"`
	Value               float64           `json:"value"`
	Active              bool              `json:"active"`
	ChargeType          ChargeType        `json:"chargeType"`
	URL                 string            `json:"url"`
	BillingType         BillingType       `json:"billingType"`
	SubscriptionCycle   SubscriptionCycle `json:"subscriptionCycle"`
	EndDate             string            `json:"endDate"`
	MaxInstallmentCount int               `json:"maxInstallmentCount"`
	DueDateLimitDays    int               `json:"dueDateLimitDays"`
	NotificationEnabled bool              `json:"notificationEnabled"`
	ExternalReference   string            `json:"externalReference"`
}

// Resposta da listagem de links do Asaas
type PaymentLinksListResponse struct {
	Object     string                `json:"object"`
	HasMore    bool                  `json:"hasMore"`
	TotalCount int                   `json:"totalCount"`
	Limit      int                   `json:"limit"`
	Offset     int                   `json:"offset"`
	Data       []PaymentLinkResponse `json:"data"`
}

// Resposta que sua API devolve para o front
type CheckoutSessionResponse struct {
	CheckoutSessionID string `json:"checkout_session_id"`
	Name              string `json:"plan_name"`
	CheckoutURL       string `json:"checkout_url"`
	Status            string `json:"status"`
	Value             int    `json:"value"`
	Currency          string `json:"currency"`
}
