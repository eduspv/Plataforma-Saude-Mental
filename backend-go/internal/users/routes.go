package users

import (
	"backend-go/internal/audit"
	"backend-go/internal/middleware"
	"backend-go/internal/plans"
	"backend-go/internal/subscriptions"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool) *Routes {
	repository := NewRepository(db)
	subsRepo := subscriptions.NewRepository(db)
	plansRepo := plans.NewRepository(db)
	auditRepo := audit.NewRepository(db)
	auditService := audit.NewService(auditRepo)

	service := NewService(repository, subsRepo, plansRepo, auditService)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	users := rg.Group("/users")
	// Rotas que requerem um role correto (admin da empresa ou do sistema)
	users.POST("/create-employee", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.RegisterNewEmployee)
	users.GET("/list-employees", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.ListOfAllCompanieEmployees)
	users.PATCH("/:id/deactivate", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.DeactivateEmployee)
	users.GET("/me", r.Handler.GetUserProfileData)
}
