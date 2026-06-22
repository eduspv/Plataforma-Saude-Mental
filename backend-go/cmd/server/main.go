package main

import (
	"log"

	"backend-go/internal/config"
	"backend-go/internal/database"
	"backend-go/internal/router"
)

func main() {
	cfg := config.LoadConfig()

	log.Println("[MAIN] Config carregada")
	log.Println("[MAIN] APP_PORT:", cfg.AppPort)
	log.Println("[MAIN] DATABASE_URL carregado?", cfg.DatabaseURL != "")
	log.Println("[MAIN] JWT_SECRET carregado?", cfg.JWTSecret != "")
	log.Println("[MAIN] ASAAS_API_KEY carregado?", cfg.ASAASAPIKey != "")
	log.Println("[MAIN] ASAAS_WEBHOOK_TOKEN carregado?", cfg.ASAASWebhookToken != "")
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
