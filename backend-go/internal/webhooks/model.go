package webhooks

import "encoding/json"

type AsaasWebhookEvent struct {
	ID      string       `json:"id"`
	Event   string       `json:"event"`
	Payment AsaasPayment `json:"payment"`
}

type AsaasPayment struct {
	ID                string      `json:"id"`
	Status            string      `json:"status"`
	ExternalReference string      `json:"externalReference"`
	Value             json.Number `json:"value"`
	BillingType       string      `json:"billingType"`
}
