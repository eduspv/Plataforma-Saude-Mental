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
	log.Printf("[WEBHOOK] >>> request recebido method=%s path=%s ip=%s", c.Request.Method, c.Request.URL.Path, c.ClientIP())

	if h.WebhookToken == "" {
		log.Printf("[WEBHOOK] ERRO: ASAAS_WEBHOOK_TOKEN não configurado no servidor — rejeitando com 401")
		c.JSON(401, gin.H{"message": "não autorizado"})
		return
	}

	receivedToken := c.GetHeader("asaas-access-token")
	log.Printf("[WEBHOOK] token recebido? %v (len=%d)", receivedToken != "", len(receivedToken))

	if subtle.ConstantTimeCompare([]byte(h.WebhookToken), []byte(receivedToken)) != 1 {
		log.Printf("[WEBHOOK] ERRO: token inválido — esperado len=%d, recebido len=%d — retornando 401", len(h.WebhookToken), len(receivedToken))
		c.JSON(401, gin.H{"message": "não autorizado"})
		return
	}

	log.Printf("[WEBHOOK] token válido, lendo body JSON")

	var payload AsaasWebhookEvent
	if err := c.ShouldBindJSON(&payload); err != nil {
		log.Printf("[WEBHOOK] ERRO ao parsear JSON: %v", err)
		c.JSON(200, gin.H{"message": "ok"})
		return
	}

	log.Printf("[WEBHOOK] payload lido: event=%s payment_id=%s external_reference=%s value=%s billing_type=%s",
		payload.Event,
		payload.Payment.ID,
		payload.Payment.ExternalReference,
		payload.Payment.Value,
		payload.Payment.BillingType,
	)

	if err := h.Service.HandleEvent(payload); err != nil {
		log.Printf("[WEBHOOK] ERRO ao processar evento: event=%s checkout_session_id=%s err=%v",
			payload.Event, payload.Payment.ExternalReference, err)
		c.JSON(200, gin.H{"message": "ok"})
		return
	}

	log.Printf("[WEBHOOK] evento processado com sucesso event=%s checkout_session_id=%s", payload.Event, payload.Payment.ExternalReference)
	c.JSON(200, gin.H{"message": "ok"})
}
