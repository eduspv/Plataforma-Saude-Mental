package checkout

type CheckoutSessionRequest struct {
	PlanID      string      `json:"plan_id" binding:"required"`
	BillingType BillingType `json:"billing_type" binding:"required"`
	ChargeType  ChargeType  `json:"charge_type" binding:"required"`

	DueDateLimitDays    *int32            `json:"due_date_limit_days,omitempty"`
	MaxInstallmentCount *int              `json:"max_installment_count,omitempty"`
	SubscriptionCycle   SubscriptionCycle `json:"subscription_cycle,omitempty"`

	Description string `json:"description,omitempty"`
	EndDate     string `json:"end_date,omitempty"`

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

	Auth AuthContext

	DueDateLimitDays    *int32
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

// Payload enviado ao Asaas para criar um customer
type CreateCustomerRequest struct {
	Name    string `json:"name"`
	CpfCnpj string `json:"cpfCnpj"`
}

// Resposta do Asaas ao criar um customer
type CreateCustomerResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	CpfCnpj string `json:"cpfCnpj"`
}

// Payload enviado ao Asaas para criar uma cobrança (/v3/payments)
type CreatePaymentRequest struct {
	Customer          string      `json:"customer"`
	BillingType       BillingType `json:"billingType"`
	Value             float64     `json:"value"`
	DueDate           string      `json:"dueDate"`
	ExternalReference string      `json:"externalReference,omitempty"`
	Description       string      `json:"description,omitempty"`
	// Parcelamento (somente CREDIT_CARD INSTALLMENT)
	InstallmentCount *int     `json:"installmentCount,omitempty"`
	TotalValue       *float64 `json:"totalValue,omitempty"`
}

// Resposta do Asaas ao criar uma cobrança
type CreatePaymentResponse struct {
	ID          string      `json:"id"`
	Customer    string      `json:"customer"`
	Status      string      `json:"status"`
	BillingType BillingType `json:"billingType"`
	Value       float64     `json:"value"`
	DueDate     string      `json:"dueDate"`
	InvoiceURL  string      `json:"invoiceUrl"`
	BankSlipURL string      `json:"bankSlipUrl"`
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
