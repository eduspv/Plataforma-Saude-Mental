package dashboard

import (
	"backend-go/internal/assesments/results"
	"backend-go/internal/middleware"
	"backend-go/internal/users"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool) *Routes {
	repository := NewRepository(db)
	userRepository := users.NewRepository(db)
	resultRepository := results.NewRepository(db)
	service := NewService(repository, userRepository, resultRepository)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	dashboard := rg.Group("/dashboard")

	//rotas que requerem um role
	dashboard.GET("/company", middleware.RequireRole("COMPANY_ADMIN", "SYSTEM_ADMIN"), r.Handler.DashboardData)
}
