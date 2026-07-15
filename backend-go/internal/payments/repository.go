package payments

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

type CreatePaymentInput struct {
	UserID            string
	CompanyID         string
	PlanID            string
	CheckoutSessionID string
	Provider          string
	ProviderPaymentID string
	AmountCents       int
	Currency          string
	PaymentMethod     string
}

// CreateTx inserts a payment inside tx with ON CONFLICT DO NOTHING for idempotency.
// Returns the UUID of the inserted row and inserted count (1 = new row, 0 = duplicate).
// On duplicate, RETURNING doesn't emit a row and Scan yields pgx.ErrNoRows, which we
// translate to (empty, 0, nil) — the caller decides what to do with a duplicate.
func (r *Repository) CreateTx(ctx context.Context, tx pgx.Tx, in CreatePaymentInput) (paymentID string, inserted int64, err error) {
	err = tx.QueryRow(ctx, `
		INSERT INTO payments (
			user_id, company_id, plan_id, checkout_session_id,
			provider, provider_payment_id,
			status, amount_cents, currency, payment_method,
			paid_at, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4,
			$5, $6,
			'paid', $7, $8, $9,
			NOW(), NOW(), NOW()
		)
		ON CONFLICT (provider_payment_id) DO NOTHING
		RETURNING id
	`,
		in.UserID, in.CompanyID, in.PlanID, in.CheckoutSessionID,
		in.Provider, in.ProviderPaymentID,
		in.AmountCents, in.Currency, in.PaymentMethod,
	).Scan(&paymentID)

	if errors.Is(err, pgx.ErrNoRows) {
		// ON CONFLICT DO NOTHING → nenhuma linha retornada = duplicata
		return "", 0, nil
	}
	if err != nil {
		return "", 0, err
	}
	return paymentID, 1, nil
}
