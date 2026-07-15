package subscriptions

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

// Retorna a subscription ativa da company, ou nil se não houver.
// nil, nil é um caminho válido — significa "primeira compra ou voltou depois de gap".
func (r *Repository) GetActiveByCompanyIDTx(ctx context.Context, tx pgx.Tx, companyID string) (*Subscription, error) {
	var s Subscription
	err := tx.QueryRow(ctx, `
		SELECT id, company_id, plan_id, last_payment_id, provider, provider_subscription_id,
		       status, started_at, current_period_start, current_period_end,
		       cancelled_at, ended_at, created_at, updated_at
		FROM subscriptions
		WHERE company_id = $1 AND status = 'active'
	`, companyID).Scan(
		&s.ID, &s.CompanyID, &s.PlanID, &s.LastPaymentID, &s.Provider, &s.ProviderSubscriptionID,
		&s.Status, &s.StartedAt, &s.CurrentPeriodStart, &s.CurrentPeriodEnd,
		&s.CancelledAt, &s.EndedAt, &s.CreatedAt, &s.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// Marca a subscription atual como expirada. Usado antes de criar uma nova.
func (r *Repository) ExpireTx(ctx context.Context, tx pgx.Tx, subscriptionID string) error {
	_, err := tx.Exec(ctx, `
		UPDATE subscriptions
		SET status = 'expired', ended_at = NOW(), updated_at = NOW()
		WHERE id = $1 AND status = 'active'
	`, subscriptionID)
	return err
}

type CreateSubscriptionInput struct {
	CompanyID          string
	PlanID             string
	LastPaymentID      *string
	Provider           *string
	CurrentPeriodStart time.Time
	CurrentPeriodEnd   time.Time
}

// Cria uma nova subscription active. Sempre INSERT, nunca UPDATE em renovação.
func (r *Repository) CreateTx(ctx context.Context, tx pgx.Tx, in CreateSubscriptionInput) (*Subscription, error) {
	var s Subscription
	err := tx.QueryRow(ctx, `
		INSERT INTO subscriptions (
			company_id, plan_id, last_payment_id, provider, status,
			started_at, current_period_start, current_period_end
		) VALUES (
			$1, $2, $3, $4, 'active',
			NOW(), $5, $6
		)
		RETURNING id, company_id, plan_id, last_payment_id, provider, provider_subscription_id,
		          status, started_at, current_period_start, current_period_end,
		          cancelled_at, ended_at, created_at, updated_at
	`,
		in.CompanyID, in.PlanID, in.LastPaymentID, in.Provider,
		in.CurrentPeriodStart, in.CurrentPeriodEnd,
	).Scan(
		&s.ID, &s.CompanyID, &s.PlanID, &s.LastPaymentID, &s.Provider, &s.ProviderSubscriptionID,
		&s.Status, &s.StartedAt, &s.CurrentPeriodStart, &s.CurrentPeriodEnd,
		&s.CancelledAt, &s.EndedAt, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}
