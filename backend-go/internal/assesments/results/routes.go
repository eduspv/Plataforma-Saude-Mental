package results

import (
	"backend-go/internal/assesments/questions"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Routes struct {
	QuestionsRepo *questions.Repository
	Handler       *Handler
}

func NewRoutes(db *pgxpool.Pool) *Routes {
	questionsRepo := questions.NewRepository(db)
	repository := NewRepository(db)
	service := NewService(questionsRepo, repository)
	handler := NewHandler(service)
	return &Routes{
		Handler: handler,
	}
}

func (r *Routes) RegisterRoutes(rg *gin.RouterGroup) {
	results := rg.Group("/diagnostic")

	results.POST("/submit-form", r.Handler.SubmitForm)
	results.GET("/history", r.Handler.UserDiagnosticHistory)
}
