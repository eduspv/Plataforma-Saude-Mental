package router

import (
	"log"
	"time"

	"backend-go/internal/auth"
	"backend-go/internal/checkout"
	"backend-go/internal/middleware"
	"backend-go/internal/plans"
	"backend-go/internal/users"
	"backend-go/internal/webhooks"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
)

func SetupRouter(db *pgxpool.Pool, jwtSecret string, APIKey string, webhookToken string) *gin.Engine {
	r := gin.Default()

	// CORS — precisa vir ANTES de registrar as rotas
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // porta do Vite
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Location"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Healthcheck / raiz
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "API rodando com Gin!"})
	})
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api/v1")

	// ─────────────────────────────────────────────
	// ROTAS PÚBLICAS (sem autenticação)
	// ─────────────────────────────────────────────
	log.Println("[ROUTER] Registrando rotas públicas")
	auth.NewRoutes(db, jwtSecret).RegisterRoutes(api)        // cadastro + login
	plans.NewRoutes(db).RegisterRoutes(api)                  // listagem de planos
	webhooks.NewRoutes(db, webhookToken).RegisterRoutes(api) // callback do Asaas

	// ─────────────────────────────────────────────
	// ROTAS PROTEGIDAS — exigem apenas login (JWT válido)
	// checkout entra aqui de propósito: empresa com plano
	// vencido precisa conseguir pagar de novo.
	// ─────────────────────────────────────────────
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware(jwtSecret))

	log.Println("[ROUTER] Registrando rotas protegidas (só login)")
	checkout.NewRoutes(db, APIKey).RegisterRoutes(protected)

	// ─────────────────────────────────────────────
	// ROTAS PROTEGIDAS — exigem login + assinatura ativa
	// ─────────────────────────────────────────────
	protectedByPlan := protected.Group("/")
	protectedByPlan.Use(middleware.RequireActivePlan(db))

	log.Println("[ROUTER] Registrando rotas protegidas (login + plano ativo)")
	users.NewRoutes(db).RegisterRoutes(protectedByPlan)

	log.Println("[ROUTER] Setup das rotas concluído")
	return r
}
