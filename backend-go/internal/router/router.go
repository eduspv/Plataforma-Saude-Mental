package router

import (
	"log"

	"backend-go/internal/auth"
	"backend-go/internal/checkout"
	"backend-go/internal/middleware"
	"backend-go/internal/users"
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

	log.Println("[ROUTER] Registrando grupo de rotas protegidas (só auth)")
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(jwtSecret))

	log.Println("[ROUTER] Registrando grupo protegido por plano (auth + plan)")
	protectedByPlan := protected.Group("/")
	protectedByPlan.Use(middleware.RequireActivePlan(db))

	// Rotas que só exigem estar logado (mesmo sem plano ativo)
	// Ex.: checkout — cliente com plano vencido precisa poder pagar de novo
	log.Println("[ROUTER] Registrando rotas protegidas de checkout")
	checkoutRoutes := checkout.NewRoutes(db, APIKey)
	checkoutRoutes.RegisterRoutes(protected)

	// Rotas que exigem plano ativo
	log.Println("[ROUTER] Registrando rotas de users (exige plano ativo)")
	userRoutes := users.NewRoutes(db)
	userRoutes.RegisterRoutes(protectedByPlan) // ← só um grupo

	log.Println("[ROUTER] Setup das rotas concluído")
	return r
}
