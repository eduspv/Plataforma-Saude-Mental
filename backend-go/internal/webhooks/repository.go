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

func (r *Repository) MarkSessionPaid(event, checkoutSessionID, valueStr string) (int64, error) {
	log.Printf("[REPO] MarkSessionPaid: event=%s checkout_session_id=%s value_str=%q", event, checkoutSessionID, valueStr)
	query := `
		UPDATE checkout_sessions
		SET status = 'paid',
		    paid_at = COALESCE(paid_at, NOW()),
		    updated_at = NOW()
		WHERE id = $1
		  AND amount_cents = ROUND($2::numeric * 100)::integer
		  AND status <> 'paid'
	`
	tag, err := r.DB.Exec(context.Background(), query, checkoutSessionID, valueStr)
	if err != nil {
		log.Printf("[REPO] ERRO ao marcar pago: event=%s checkout_session_id=%s err=%v", event, checkoutSessionID, err)
		return 0, err
	}
	rows := tag.RowsAffected()
	log.Printf("[REPO] MarkSessionPaid executado: rows_affected=%d checkout_session_id=%s", rows, checkoutSessionID)
	return rows, nil
}

func (r *Repository) GetSessionStatus(checkoutSessionID string) (string, error) {
	var status string
	err := r.DB.QueryRow(
		context.Background(),
		`SELECT status FROM checkout_sessions WHERE id = $1`,
		checkoutSessionID,
	).Scan(&status)
	if err != nil {
		if err == pgx.ErrNoRows {
			return "", pgx.ErrNoRows
		}
		return "", err
	}
	return status, nil
}

func (r *Repository) MarkSessionExpired(checkoutSessionID string) error {
	query := `
		UPDATE checkout_sessions
		SET status = 'expired',
		    updated_at = NOW()
		WHERE id = $1
		  AND status NOT IN ('paid', 'cancelled')
	`
	_, err := r.DB.Exec(context.Background(), query, checkoutSessionID)
	if err != nil {
		log.Printf("webhook Asaas: erro ao marcar expirado checkout_session_id=%s", checkoutSessionID)
	}
	return err
}

func (r *Repository) MarkSessionCancelled(checkoutSessionID string, excludePaid bool) error {
	var query string
	if excludePaid {
		query = `
			UPDATE checkout_sessions
			SET status = 'cancelled',
			    updated_at = NOW()
			WHERE id = $1
			  AND status <> 'paid'
		`
	} else {
		query = `
			UPDATE checkout_sessions
			SET status = 'cancelled',
			    updated_at = NOW()
			WHERE id = $1
		`
	}
	_, err := r.DB.Exec(context.Background(), query, checkoutSessionID)
	if err != nil {
		log.Printf("webhook Asaas: erro ao marcar cancelado checkout_session_id=%s", checkoutSessionID)
	}
	return err
}
