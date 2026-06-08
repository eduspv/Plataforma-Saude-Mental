package checkout

import (
	"backend-go/internal/plans"
	"context"
	"errors"

	"github.com/jackc/pgx"
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

func (r *Repository) GetActivePlanByID(planID string) (*plans.Plan, error) {
	query := `
		SELECT
			id,
			name,
			COALESCE(description, ''),
			price_cents,
			currency,
			billing_cycle,
			max_employees,
			is_active
		FROM plans
		WHERE id = $1
		AND is_active = true
	`

	var plan plans.Plan

	err := r.DB.QueryRow(
		context.Background(),
		query,
		planID,
	).Scan(
		&plan.ID,
		&plan.Name,
		&plan.Description,
		&plan.PriceCents,
		&plan.Currency,
		&plan.BillingCycle,
		&plan.MaxEmployees,
		&plan.IsActive,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("plano não encontrado ou inativo")
		}

		return nil, err
	}

	return &plan, nil
}
