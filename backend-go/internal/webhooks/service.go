package webhooks

import (
	"context"
	"errors"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	DB *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{DB: db}
}

func (s *Service) HandleEvent(payload AsaasWebhookEvent) error {
	checkoutSessionID := payload.Payment.ExternalReference
	if checkoutSessionID == "" {
		log.Printf("webhook Asaas: externalReference vazio event=%s", payload.Event)
		return nil
	}

	switch payload.Event {
	case "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED":
		return s.handlePaymentPaid(payload.Event, checkoutSessionID, string(payload.Payment.Value))
	case "PAYMENT_OVERDUE":
		return s.handlePaymentOverdue(checkoutSessionID)
	case "PAYMENT_DELETED":
		return s.handlePaymentDeleted(checkoutSessionID)
	case "PAYMENT_REFUNDED":
		return s.handlePaymentRefunded(checkoutSessionID)
	default:
		log.Printf("webhook Asaas: evento ignorado event=%s checkout_session_id=%s", payload.Event, checkoutSessionID)
		return nil
	}
}

func (s *Service) handlePaymentPaid(event, checkoutSessionID, valueStr string) error {
	query := `
		UPDATE checkout_sessions
		SET status = 'paid',
		    paid_at = COALESCE(paid_at, NOW()),
		    updated_at = NOW()
		WHERE id = $1
		  AND amount_cents = ROUND($2::numeric * 100)::integer
		  AND status <> 'paid'
	`
	tag, err := s.DB.Exec(context.Background(), query, checkoutSessionID, valueStr)
	if err != nil {
		log.Printf("webhook Asaas: erro ao atualizar status event=%s checkout_session_id=%s", event, checkoutSessionID)
		return err
	}

	if tag.RowsAffected() == 0 {
		s.diagnosePaidNoOp(event, checkoutSessionID)
	}

	return nil
}

func (s *Service) diagnosePaidNoOp(event, checkoutSessionID string) {
	var status string
	err := s.DB.QueryRow(
		context.Background(),
		`SELECT status FROM checkout_sessions WHERE id = $1`,
		checkoutSessionID,
	).Scan(&status)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("webhook Asaas: sessão não encontrada event=%s checkout_session_id=%s", event, checkoutSessionID)
			return
		}
		log.Printf("webhook Asaas: erro no diagnóstico event=%s checkout_session_id=%s", event, checkoutSessionID)
		return
	}

	if status == "paid" {
		log.Printf("webhook Asaas: sessão já paga (no-op) event=%s checkout_session_id=%s", event, checkoutSessionID)
		return
	}

	log.Printf("webhook Asaas: value mismatch event=%s checkout_session_id=%s", event, checkoutSessionID)
}

func (s *Service) handlePaymentOverdue(checkoutSessionID string) error {
	query := `
		UPDATE checkout_sessions
		SET status = 'expired',
		    updated_at = NOW()
		WHERE id = $1
		  AND status NOT IN ('paid', 'cancelled')
	`
	_, err := s.DB.Exec(context.Background(), query, checkoutSessionID)
	if err != nil {
		log.Printf("webhook Asaas: erro ao atualizar status event=PAYMENT_OVERDUE checkout_session_id=%s", checkoutSessionID)
		return err
	}
	return nil
}

func (s *Service) handlePaymentDeleted(checkoutSessionID string) error {
	query := `
		UPDATE checkout_sessions
		SET status = 'cancelled',
		    updated_at = NOW()
		WHERE id = $1
		  AND status <> 'paid'
	`
	_, err := s.DB.Exec(context.Background(), query, checkoutSessionID)
	if err != nil {
		log.Printf("webhook Asaas: erro ao atualizar status event=PAYMENT_DELETED checkout_session_id=%s", checkoutSessionID)
		return err
	}
	return nil
}

func (s *Service) handlePaymentRefunded(checkoutSessionID string) error {
	query := `
		UPDATE checkout_sessions
		SET status = 'cancelled',
		    updated_at = NOW()
		WHERE id = $1
	`
	_, err := s.DB.Exec(context.Background(), query, checkoutSessionID)
	if err != nil {
		log.Printf("webhook Asaas: erro ao atualizar status event=PAYMENT_REFUNDED checkout_session_id=%s", checkoutSessionID)
		return err
	}
	return nil
}
