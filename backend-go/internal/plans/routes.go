package plans

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool) *Routes {
	repository := NewRepository(db)

	service := NewService(repository)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	plans := rg.Group("/plans")

	plans.GET("/all-active", r.Handler.GetAllPLans)
}
