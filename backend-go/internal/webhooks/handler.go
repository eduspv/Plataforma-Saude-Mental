package webhooks

import (
	"crypto/subtle"
	"log"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service      *Service
	WebhookToken string
}

func NewHandler(service *Service, webhookToken string) *Handler {
	return &Handler{
		Service:      service,
		WebhookToken: webhookToken,
	}
}

func (h *Handler) HandleAsaasWebhook(c *gin.Context) {
	if h.WebhookToken == "" {
		log.Printf("webhook Asaas: ASAAS_WEBHOOK_TOKEN não configurado")
		c.JSON(401, gin.H{"message": "não autorizado"})
		return
	}

	receivedToken := c.GetHeader("asaas-access-token")
	if subtle.ConstantTimeCompare([]byte(h.WebhookToken), []byte(receivedToken)) != 1 {
		c.JSON(401, gin.H{"message": "não autorizado"})
		return
	}

	var payload AsaasWebhookEvent
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("webhook Asaas: JSON inválido")
		c.JSON(200, gin.H{"message": "ok"})
		return
	}

	if err := h.Service.HandleEvent(payload); err != nil {
		log.Printf("webhook Asaas: erro interno event=%s checkout_session_id=%s", payload.Event, payload.Payment.ExternalReference)
		c.JSON(200, gin.H{"message": "ok"})
		return
	}

	c.JSON(200, gin.H{"message": "ok"})
}
