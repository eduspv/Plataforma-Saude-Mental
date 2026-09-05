package webhooks

import (
	"backend-go/internal/plans"
	"backend-go/internal/subscriptions"
	"backend-go/internal/users"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool, webhookToken string) *Routes {
	plansRepo := plans.NewRepository(db)
	subsRepo := subscriptions.NewRepository(db)
	userRepo := users.NewRepository(db)
	subsService := subscriptions.NewService(subsRepo, plansRepo)
	repo := NewRepository(db)
	service := NewService(db, repo, subsService, userRepo)
	handler := NewHandler(service, webhookToken)
	return &Routes{Handler: handler}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	webhooks := rg.Group("/webhooks")
	webhooks.POST("/asaas", r.Handler.HandleAsaasWebhook)
}
