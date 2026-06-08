package checkout

type CheckoutSessionRequest struct {
	Plan_id string `json:"plan_id" binding:"required"`
}

type CheckoutSessionResponse struct {
	Checkout_session_id string `json:"checkout_session_id"`
	Checkout_url        string `json:"checkout_url"`
	Status              string `json:"status"`
}
