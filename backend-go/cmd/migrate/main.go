package main

import (
	"log"
	"os"

	"backend-go/internal/migrations"

	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load()

	if len(os.Args) < 2 {
		log.Fatal("uso: migrate <up|down>")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL não configurado")
	}

	var err error
	switch os.Args[1] {
	case "up":
		err = migrations.Up(databaseURL)
	case "down":
		err = migrations.Down(databaseURL)
	default:
		log.Fatalf("comando desconhecido: %q (use up|down)", os.Args[1])
	}

	if err != nil {
		log.Fatal(err)
	}

	log.Println("migrate:", os.Args[1], "concluído com sucesso")
}
