package checkout

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool, APIKey string) *Routes {
	repository := NewRepository(db)
	api := NewAPIClient(APIKey)

	service := NewService(repository, api)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	plans := rg.Group("/checkout")

	plans.POST("/create-session", r.Handler.CreateSession)
}
