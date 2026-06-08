package router

import (
	"backend-go/internal/auth"
	"backend-go/internal/checkout"
	"backend-go/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRouter(db *pgxpool.Pool, jwtSecret string) *gin.Engine {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "API rodando com Gin!",
		})
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	//Rotas não protegidas
	api := r.Group("/api/v1")

	//Rotas de autenticação
	authRoutes := auth.NewRoutes(db, jwtSecret)
	authRoutes.RegisterRoutes(api)

	//Rotas protegidas
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(jwtSecret))

	//Rotas dos planos
	checkoutRoutes := checkout.NewRoutes(db)
	checkoutRoutes.RegisterRoutes(protected)

	return r
}
