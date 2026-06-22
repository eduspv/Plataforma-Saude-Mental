package router

import (
	"log"

	"backend-go/internal/auth"
	"backend-go/internal/checkout"
	"backend-go/internal/middleware"
	"backend-go/internal/webhooks"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRouter(db *pgxpool.Pool, jwtSecret string, APIKey string, webhookToken string) *gin.Engine {
	log.Println("[ROUTER] Iniciando setup das rotas")
	log.Println("[ROUTER] JWT_SECRET recebido?", jwtSecret != "")
	log.Println("[ROUTER] ASAAS_API_KEY recebida?", APIKey != "")
	log.Println("[ROUTER] ASAAS_WEBHOOK_TOKEN recebido?", webhookToken != "")

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

	log.Println("[ROUTER] Registrando rotas públicas de auth")
	authRoutes := auth.NewRoutes(db, jwtSecret)
	authRoutes.RegisterRoutes(api)

	log.Println("[ROUTER] Registrando rotas públicas de webhook")
	webhookRoutes := webhooks.NewRoutes(db, webhookToken)
	webhookRoutes.RegisterRoutes(api)

	log.Println("[ROUTER] Registrando grupo de rotas protegidas")
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(jwtSecret))

	log.Println("[ROUTER] Registrando rotas protegidas de checkout")
	checkoutRoutes := checkout.NewRoutes(db, APIKey)
	checkoutRoutes.RegisterRoutes(protected)

	log.Println("[ROUTER] Setup das rotas concluído")

	return r
}
