package checkout

type CheckoutSessionRequest struct {
	PlanID string `json:"plan_id" binding:"required"`
}

type AuthContext struct {
	UserID    string
	CompanyID string
	Role      string
	Status    string
}

type CreateCheckoutSessionInput struct {
	PlanID string
	Auth   AuthContext
}

type CheckoutSessionResponse struct {
	CheckoutSessionID string `json:"checkout_session_id"`
	CheckoutURL       string `json:"checkout_url"`
	Status            string `json:"status"`
	AmountCents       int    `json:"amount_cents"`
	Currency          string `json:"currency"`
}
