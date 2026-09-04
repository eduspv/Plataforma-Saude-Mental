package companies

import (
	"backend-go/internal/middleware"
	"backend-go/internal/payments"
	"backend-go/internal/plans"
	"backend-go/internal/subscriptions"
	"backend-go/internal/users"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool) *Routes {
	repository := NewRepository(db)
	subscriptionRepo := subscriptions.NewRepository(db)
	plansRepo := plans.NewRepository(db)
	PaymentRepo := payments.NewRepository(db)
	userRepo := users.NewRepository(db)

	service := NewService(repository, subscriptionRepo, plansRepo, PaymentRepo, userRepo)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	company := rg.Group("/companies")
	// Rotas que requerem um role correto (admin da empresa ou do sistema)
	company.GET("/me", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.GetCompanyProfileData)
	company.GET("/plans-dashboard", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.GetCompanyPlanData)
	company.GET("/payments", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.CompanyPaymentData)
}
