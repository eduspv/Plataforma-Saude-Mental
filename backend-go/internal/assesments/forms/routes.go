package forms

import (
	"backend-go/internal/assesments/questions"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	Handler *Handler
}

func NewRoutes(db *pgxpool.Pool) *Routes {
	questionsRepo := questions.NewRepository(db)

	service := NewService(questionsRepo)
	handler := NewHandler(service)

	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	forms := rg.Group("/diagnostic")

	forms.GET("/form", r.Handler.GetForm)
}
