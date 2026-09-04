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

// GetPaymentMethodByPlanID retorna o payment_method do pagamento mais recente
// da empresa para aquele plano. Isolado por company_id — nunca vaza dado de
// outra empresa. Se a empresa não tem pagamento pago para o plano, retorna
// string vazia sem erro (não quebra o dashboard).
func (r *Repository) GetPaymentMethodByPlanID(ctx context.Context, planID, companyID string) (string, error) {
	var paymentMethod string
	query := `
		SELECT payment_method
		FROM payments
		WHERE plan_id = $1
		  AND company_id = $2
		  AND status = 'paid'
		ORDER BY paid_at DESC
		LIMIT 1
	`
	err := r.DB.QueryRow(ctx, query, planID, companyID).Scan(&paymentMethod)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil
		}
		return "", err
	}
	return paymentMethod, nil
}

// ListPaidByCompany retorna todas as cobranças pagas da empresa,
// mais recentes primeiro. Isolamento por company_id (vindo do JWT).
func (r *Repository) ListPaidByCompany(ctx context.Context, companyID string) ([]*PaymentRow, error) {
	const query = `
		SELECT id, amount_cents, currency, payment_method, status, paid_at
		FROM payments
		WHERE company_id = $1
		  AND status = 'paid'
		ORDER BY paid_at DESC
	`

	rows, err := r.DB.Query(ctx, query, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []*PaymentRow
	for rows.Next() {
		var p PaymentRow
		if err := rows.Scan(
			&p.ID,
			&p.AmountCents,
			&p.Currency,
			&p.PaymentMethod,
			&p.Status,
			&p.PaidAt,
		); err != nil {
			return nil, err
		}
		payments = append(payments, &p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return payments, nil
}

// SummaryByCompany calcula o total pago da empresa.
func (r *Repository) SummaryByCompany(ctx context.Context, companyID string) (*PaymentsSummary, error) {
	const query = `
		SELECT
			COALESCE(SUM(amount_cents), 0) AS total_paid_cents,
			COALESCE(MAX(currency), 'BRL') AS currency
		FROM payments
		WHERE company_id = $1
		  AND status = 'paid'
	`

	s := &PaymentsSummary{}
	err := r.DB.QueryRow(ctx, query, companyID).Scan(
		&s.TotalPaidCents,
		&s.Currency,
	)
	if err != nil {
		return nil, err
	}

	return s, nil
}
