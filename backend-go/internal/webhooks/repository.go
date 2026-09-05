package webhooks

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

// sessionPaymentData holds the checkout_session fields needed to create a payment record.
// Values come from the database — never from the webhook payload — to prevent forged amounts.
type sessionPaymentData struct {
	UserID      string
	CompanyID   string
	PlanID      string
	AmountCents int
	Currency    string
}

// MarkSessionPaidTx updates the checkout_session status inside an existing transaction.
// The WHERE clause validates that the Asaas value matches our recorded amount_cents,
// preventing a forged value from triggering a paid transition.
// Returns rows affected: 1 = updated, 0 = already paid, not found, or value mismatch.
func (r *Repository) MarkSessionPaidTx(ctx context.Context, tx pgx.Tx, event, checkoutSessionID, valueStr string) (int64, error) {
	log.Printf("[REPO] MarkSessionPaidTx: event=%s checkout_session_id=%s value_str=%q", event, checkoutSessionID, valueStr)
	tag, err := tx.Exec(ctx, `
		UPDATE checkout_sessions
		SET status    = 'paid',
		    paid_at   = COALESCE(paid_at, NOW()),
		    updated_at = NOW()
		WHERE id          = $1
		  AND amount_cents = ROUND($2::numeric * 100)::integer
		  AND status      <> 'paid'
	`, checkoutSessionID, valueStr)
	if err != nil {
		log.Printf("[REPO] ERRO em MarkSessionPaidTx: event=%s checkout_session_id=%s err=%v", event, checkoutSessionID, err)
		return 0, err
	}
	rows := tag.RowsAffected()
	log.Printf("[REPO] MarkSessionPaidTx: rows_affected=%d checkout_session_id=%s", rows, checkoutSessionID)
	return rows, nil
}

// GetSessionByIDTx reads the fields needed to populate a payment record, inside tx.
// Must be called after MarkSessionPaidTx succeeds so the UPDATE lock is held,
// guaranteeing a consistent read within the same transaction.
func (r *Repository) GetSessionByIDTx(ctx context.Context, tx pgx.Tx, id string) (sessionPaymentData, error) {
	var s sessionPaymentData
	err := tx.QueryRow(ctx, `
		SELECT user_id, company_id, plan_id, amount_cents, currency
		FROM checkout_sessions
		WHERE id = $1
	`, id).Scan(&s.UserID, &s.CompanyID, &s.PlanID, &s.AmountCents, &s.Currency)
	return s, err
}

// GetSessionStatus reads the current status of a session using the pool (outside any tx).
// Used only for post-rollback diagnostics.
func (r *Repository) GetSessionStatus(checkoutSessionID string) (string, error) {
	var status string
	err := r.DB.QueryRow(
		context.Background(),
		`SELECT status FROM checkout_sessions WHERE id = $1`,
		checkoutSessionID,
	).Scan(&status)
	if err != nil {
		return "", err
	}
	return status, nil
}

func (r *Repository) MarkSessionExpired(checkoutSessionID string) error {
	_, err := r.DB.Exec(context.Background(), `
		UPDATE checkout_sessions
		SET status     = 'expired',
		    updated_at = NOW()
		WHERE id     = $1
		  AND status NOT IN ('paid', 'cancelled')
	`, checkoutSessionID)
	if err != nil {
		log.Printf("[REPO] erro ao marcar expirado checkout_session_id=%s err=%v", checkoutSessionID, err)
	}
	return err
}

func (r *Repository) MarkSessionCancelled(checkoutSessionID string, excludePaid bool) error {
	var query string
	if excludePaid {
		query = `
			UPDATE checkout_sessions
			SET status     = 'cancelled',
			    updated_at = NOW()
			WHERE id     = $1
			  AND status <> 'paid'
		`
	} else {
		query = `
			UPDATE checkout_sessions
			SET status     = 'cancelled',
			    updated_at = NOW()
			WHERE id = $1
		`
	}
	_, err := r.DB.Exec(context.Background(), query, checkoutSessionID)
	if err != nil {
		log.Printf("[REPO] erro ao marcar cancelado checkout_session_id=%s err=%v", checkoutSessionID, err)
	}
	return err
}
