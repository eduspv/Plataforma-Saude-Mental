package main

import (
	"log"

	"backend-go/internal/config"
	"backend-go/internal/database"
	"backend-go/internal/router"
	"backend-go/internal/shared/logger"
)

func main() {
	cfg := config.LoadConfig()
	logger.Init(cfg.AppEnv)

	logger.Debug("[MAIN] Config carregada")
	logger.Debug("[MAIN] APP_PORT: %s", cfg.AppPort)
	logger.Debug("[MAIN] DATABASE_URL carregado? %t", cfg.DatabaseURL != "")
	logger.Debug("[MAIN] JWT_SECRET carregado? %t", cfg.JWTSecret != "")
	logger.Debug("[MAIN] ASAAS_API_KEY carregado? %t (len=%d)", cfg.ASAASAPIKey != "", len(cfg.ASAASAPIKey))
	logger.Debug("[MAIN] ASAAS_WEBHOOK_TOKEN carregado? %t", cfg.ASAASWebhookToken != "")

	//verificação por ser necessario essa validação de segurança
	if cfg.ASAASWebhookToken == "" {
		log.Fatal("[MAIN] ASAAS_WEBHOOK_TOKEN não configurado")
	}

	db := database.Connect(cfg.DatabaseURL)
	defer db.Close()

	r := router.SetupRouter(db, cfg.JWTSecret, cfg.ASAASAPIKey, cfg.ASAASWebhookToken)

	log.Println("[MAIN] Servidor rodando na porta " + cfg.AppPort)

	err := r.Run(":" + cfg.AppPort)
	if err != nil {
		log.Fatal("[MAIN] Erro ao iniciar servidor: ", err)
	}
}
