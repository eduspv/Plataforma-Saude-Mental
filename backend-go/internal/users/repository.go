package users

import "github.com/jackc/pgx/v5/pgxpool"

type Repository struct {
	Db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		Db: db,
	}
}
