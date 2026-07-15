package plans

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) GetByIDTx(ctx context.Context, tx pgx.Tx, id string) (*Plan, error) {
	var p Plan
	err := tx.QueryRow(ctx, `
		SELECT id, name, billing_cycle, price_cents, currency
		FROM plans
		WHERE id = $1
	`, id).Scan(&p.ID, &p.Name, &p.BillingCycle, &p.PriceCents, &p.Currency)
	if err != nil {
		return nil, err
	}
	return &p, nil
}
