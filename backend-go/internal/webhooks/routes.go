package webhooks

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool, webhookToken string) *Routes {
	service := NewService(db)
	handler := NewHandler(service, webhookToken)
	return &Routes{Handler: handler}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	webhooks := rg.Group("/webhooks")
	webhooks.POST("/asaas", r.Handler.HandleAsaasWebhook)
}
