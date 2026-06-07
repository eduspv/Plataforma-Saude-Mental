package database

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

func Connect(databaseURL string) *pgxpool.Pool {
	db, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal("Erro ao criar conexão com PostgreSQL: ", err)
	}

	err = db.Ping(context.Background())
	if err != nil {
		log.Fatal("Erro ao conectar no PostgreSQL: ", err)
	}

	log.Println("Conectado ao PostgreSQL com sucesso!")

	return db
}
