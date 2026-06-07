package main

import (
	"log"

	"backend-go/internal/config"
	"backend-go/internal/database"
	"backend-go/internal/router"
)

func main() {
	cfg := config.LoadConfig()

	db := database.Connect(cfg.DatabaseURL)
	defer db.Close()

	r := router.SetupRouter(db, cfg.JWTSecret)

	log.Println("Servidor rodando na porta " + cfg.AppPort)

	err := r.Run(":" + cfg.AppPort)
	if err != nil {
		log.Fatal("Erro ao iniciar servidor: ", err)
	}
}
