package auth

import (
	"backend-go/internal/companies"
	"backend-go/internal/users"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool, jwtSecret string) *Routes {
	repository := NewRepository(db)
	UserRepo := users.NewRepository(db)
	CompanyRepo := companies.NewRepository(db)
	apiClient := NewAPIClient()

	service := NewService(repository, UserRepo, CompanyRepo, apiClient, jwtSecret)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")

	auth.POST("/register-company", r.Handler.RegisterCompany)
	auth.POST("/login-user", r.Handler.UserLogin)
	auth.POST("login-company", r.Handler.CompanyLogin)
}
