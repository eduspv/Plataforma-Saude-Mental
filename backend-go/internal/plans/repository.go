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

func (r *Repository) ListActivePlans(ctx context.Context) ([]Plan, error) {
	query := `
		SELECT id, name, description, price_cents, currency,
		       due_date_limit_days, billing_cycle, max_employees,
		       is_active, created_at, updated_at
		FROM plans
		WHERE is_active = true
		ORDER BY max_employees;
	`

	rows, err := r.DB.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	plans := make([]Plan, 0)
	for rows.Next() {
		var p Plan
		err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.Description,
			&p.PriceCents,
			&p.Currency,
			&p.DueDateLimitDays,
			&p.BillingCycle,
			&p.MaxEmployees,
			&p.IsActive,
			&p.CreatedAt,
			&p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		plans = append(plans, p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return plans, nil
}

func (r *Repository) GetMaxEmployeesByID(planID string) (int, error) {
	var maxEmployees int

	query := `
		SELECT max_employees FROM plans WHERE id = $1
	`
	err := r.DB.QueryRow(context.Background(), query, planID).Scan(&maxEmployees)
	if err != nil {
		return -1, err
	}
	return maxEmployees, nil
}

func (r *Repository) GetPlanDashboardData(ctx context.Context, planID string) (*PlanDashboardData, error) {
	Data := &PlanDashboardData{}
	query := `
		SELECT name, max_employees, price_cents, currency, billing_cycle FROM plans WHERE id = $1
	`
	err := r.DB.QueryRow(ctx, query, planID).Scan(&Data.Name, &Data.MaxEmployees, &Data.PriceCents, &Data.Currency, &Data.BillingCycle)
	if err != nil {
		return nil, err
	}
	return Data, nil
}
