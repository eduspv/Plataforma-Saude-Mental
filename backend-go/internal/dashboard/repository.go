package dashboard

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		DB: db,
	}
}

func (r *Repository) CountTestsByClassification(ctx context.Context, companyID string) (map[string]int, error) {
	query := `
		SELECT classification, COUNT(*)
		FROM diagnostic_tests
		WHERE company_id = $1
		GROUP BY classification`

	rows, err := r.DB.Query(ctx, query, companyID)
	if err != nil {
		return nil, fmt.Errorf("agregar por classificação: %w", err)
	}
	defer rows.Close()

	counts := make(map[string]int)
	for rows.Next() {
		var classification string
		var count int
		if err := rows.Scan(&classification, &count); err != nil {
			return nil, fmt.Errorf("ler agregação: %w", err)
		}
		counts[classification] = count
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterar agregação: %w", err)
	}

	return counts, nil
}
