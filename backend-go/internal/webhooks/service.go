package webhooks

import (
	"errors"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	Repo *Repository
}

func NewService(db *pgxpool.Pool, repo *Repository) *Service {
	return &Service{Repo: repo}
}

func (s *Service) HandleEvent(payload AsaasWebhookEvent) error {
	checkoutSessionID := payload.Payment.ExternalReference
	log.Printf("[SERVICE] HandleEvent chamado: event=%s checkout_session_id=%q", payload.Event, checkoutSessionID)

	if checkoutSessionID == "" {
		log.Printf("[SERVICE] externalReference vazio — ignorando evento event=%s", payload.Event)
		return nil
	}

	switch payload.Event {
	case "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED":
		log.Printf("[SERVICE] encaminhando para handlePaymentPaid event=%s checkout_session_id=%s value=%s", payload.Event, checkoutSessionID, payload.Payment.Value)
		return s.handlePaymentPaid(payload.Event, checkoutSessionID, string(payload.Payment.Value))
	case "PAYMENT_OVERDUE":
		log.Printf("[SERVICE] marcando sessão como expirada checkout_session_id=%s", checkoutSessionID)
		return s.Repo.MarkSessionExpired(checkoutSessionID)
	case "PAYMENT_DELETED":
		log.Printf("[SERVICE] marcando sessão como cancelada (excludePaid=true) checkout_session_id=%s", checkoutSessionID)
		return s.Repo.MarkSessionCancelled(checkoutSessionID, true)
	case "PAYMENT_REFUNDED":
		log.Printf("[SERVICE] marcando sessão como cancelada (excludePaid=false) checkout_session_id=%s", checkoutSessionID)
		return s.Repo.MarkSessionCancelled(checkoutSessionID, false)
	default:
		log.Printf("[SERVICE] evento ignorado (não mapeado): event=%s checkout_session_id=%s", payload.Event, checkoutSessionID)
		return nil
	}
}

func (s *Service) handlePaymentPaid(event, checkoutSessionID, valueStr string) error {
	log.Printf("[SERVICE] handlePaymentPaid: event=%s checkout_session_id=%s value=%q", event, checkoutSessionID, valueStr)
	rowsAffected, err := s.Repo.MarkSessionPaid(event, checkoutSessionID, valueStr)
	if err != nil {
		log.Printf("[SERVICE] ERRO em MarkSessionPaid: %v", err)
		return err
	}
	log.Printf("[SERVICE] MarkSessionPaid concluído: rowsAffected=%d checkout_session_id=%s", rowsAffected, checkoutSessionID)
	if rowsAffected == 0 {
		log.Printf("[SERVICE] 0 linhas afetadas — iniciando diagnóstico checkout_session_id=%s", checkoutSessionID)
		s.diagnosePaidNoOp(event, checkoutSessionID)
	}
	return nil
}

func (s *Service) diagnosePaidNoOp(event, checkoutSessionID string) {
	status, err := s.Repo.GetSessionStatus(checkoutSessionID)
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

	log.Printf("webhook Asaas: value mismatch event=%s checkout_session_id=%s status=%s", event, checkoutSessionID, status)
}
