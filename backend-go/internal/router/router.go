package router

import (
	"backend-go/internal/auth"

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

	api := r.Group("/api/v1")

	authRoutes := auth.NewRoutes(db, jwtSecret)
	authRoutes.RegisterRoutes(api)

	return r
}
