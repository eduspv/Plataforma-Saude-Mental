package webhooks

import (
	"context"
	"errors"
	"log"

	"backend-go/internal/payments"
	"backend-go/internal/subscriptions"
	"backend-go/internal/users"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	Repo        *Repository
	DB          *pgxpool.Pool
	PaymentRepo *payments.Repository
	SubsService *subscriptions.Service
	UserRepo    *users.Repository
}

func NewService(db *pgxpool.Pool, repo *Repository, subsService *subscriptions.Service, userRepo *users.Repository) *Service {
	return &Service{
		Repo:        repo,
		DB:          db,
		PaymentRepo: payments.NewRepository(db),
		SubsService: subsService,
		UserRepo:    userRepo,
	}
}

func (s *Service) HandleEvent(payload AsaasWebhookEvent) error {
	checkoutSessionID := payload.Payment.ExternalReference
	log.Printf("[SERVICE] HandleEvent: event=%s checkout_session_id=%q", payload.Event, checkoutSessionID)

	if checkoutSessionID == "" {
		log.Printf("[SERVICE] externalReference vazio — ignorando event=%s", payload.Event)
		return nil
	}

	switch payload.Event {
	case "PAYMENT_CONFIRMED", "PAYMENT_RECEIVED":
		log.Printf("[SERVICE] pagamento confirmado: event=%s checkout_session_id=%s provider_payment_id=%s",
			payload.Event, checkoutSessionID, payload.Payment.ID)
		return s.handlePaymentPaid(
			payload.Event,
			checkoutSessionID,
			payload.Payment.ID,
			payload.Payment.BillingType,
			string(payload.Payment.Value),
		)
	case "PAYMENT_OVERDUE":
		log.Printf("[SERVICE] marcando expirado: checkout_session_id=%s", checkoutSessionID)
		return s.Repo.MarkSessionExpired(checkoutSessionID)
	case "PAYMENT_DELETED":
		log.Printf("[SERVICE] marcando cancelado (excludePaid=true): checkout_session_id=%s", checkoutSessionID)
		return s.Repo.MarkSessionCancelled(checkoutSessionID, true)
	case "PAYMENT_REFUNDED":
		log.Printf("[SERVICE] marcando cancelado (excludePaid=false): checkout_session_id=%s", checkoutSessionID)
		return s.Repo.MarkSessionCancelled(checkoutSessionID, false)
	default:
		log.Printf("[SERVICE] evento ignorado: event=%s checkout_session_id=%s", payload.Event, checkoutSessionID)
		return nil
	}
}

func (s *Service) handlePaymentPaid(event, checkoutSessionID, providerPaymentID, billingType, valueStr string) error {
	ctx := context.Background()

	tx, err := s.DB.Begin(ctx)
	if err != nil {
		log.Printf("[SERVICE] ERRO ao abrir transação: event=%s checkout_session_id=%s err=%v", event, checkoutSessionID, err)
		return err
	}
	defer tx.Rollback(ctx) // no-op after Commit; runs on any early return

	rowsAffected, err := s.Repo.MarkSessionPaidTx(ctx, tx, event, checkoutSessionID, valueStr)
	if err != nil {
		log.Printf("[SERVICE] ERRO em MarkSessionPaidTx: event=%s checkout_session_id=%s err=%v", event, checkoutSessionID, err)
		return err
	}
	if rowsAffected == 0 {
		// Rollback via defer; diagnose outside the tx using the pool
		log.Printf("[SERVICE] 0 linhas afetadas — iniciando diagnóstico: event=%s checkout_session_id=%s", event, checkoutSessionID)
		s.diagnosePaidNoOp(event, checkoutSessionID)
		return nil
	}

	session, err := s.Repo.GetSessionByIDTx(ctx, tx, checkoutSessionID)
	if err != nil {
		log.Printf("[SERVICE] ERRO ao ler sessão: event=%s checkout_session_id=%s err=%v", event, checkoutSessionID, err)
		return err
	}

	paymentID, inserted, err := s.PaymentRepo.CreateTx(ctx, tx, payments.CreatePaymentInput{
		UserID:            session.UserID,
		CompanyID:         session.CompanyID,
		PlanID:            session.PlanID,
		CheckoutSessionID: checkoutSessionID,
		Provider:          "asaas",
		ProviderPaymentID: providerPaymentID,
		AmountCents:       session.AmountCents, // from DB, not from Asaas payload
		Currency:          session.Currency,
		PaymentMethod:     billingType,
	})
	if err != nil {
		return err
	}

	// Duplicata: NÃO ativa subscription. Commit e volta.
	if inserted == 0 {
		log.Printf("[SERVICE] payment duplicado ignorado (ON CONFLICT): event=%s checkout_session_id=%s provider_payment_id=%s",
			event, checkoutSessionID, providerPaymentID)
		return tx.Commit(ctx)
	}

	log.Printf("[SERVICE] payment criado: event=%s checkout_session_id=%s provider_payment_id=%s amount_cents=%d",
		event, checkoutSessionID, providerPaymentID, session.AmountCents)

	// Payment novo → ativa a subscription na MESMA transação.
	if err := s.SubsService.ActivateFromPaymentTx(ctx, tx, subscriptions.ActivateFromPaymentInput{
		CompanyID: session.CompanyID,
		PlanID:    session.PlanID,
		PaymentID: paymentID,
	}); err != nil {
		log.Printf("[SERVICE] ERRO ao ativar subscription: %v", err)
		return err // defer Rollback desfaz TUDO — inclusive o payment
	}

	log.Printf("[SERVICE] subscription ativada company_id=%s plan_id=%s",
		session.CompanyID, session.PlanID)
	// Payment novo → ativa também o admin da empresa, na MESMA transação.
	// Sem isso, o users.status do admin nunca vira 'active' e o login
	// devolve ele pro /planos pra sempre, mesmo tendo pago.
	if err := s.UserRepo.ActivateCompanyAdmin(ctx, tx, session.CompanyID); err != nil {
		log.Printf("[SERVICE] ERRO ao ativar admin da empresa: %v", err)
		return err // defer Rollback desfaz TUDO — inclusive subscription e payment
	}

	log.Printf("[SERVICE] admin da empresa ativado company_id=%s", session.CompanyID)

	return tx.Commit(ctx)
}

func (s *Service) diagnosePaidNoOp(event, checkoutSessionID string) {
	status, err := s.Repo.GetSessionStatus(checkoutSessionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			log.Printf("[SERVICE] sessão não encontrada: event=%s checkout_session_id=%s", event, checkoutSessionID)
			return
		}
		log.Printf("[SERVICE] erro no diagnóstico: event=%s checkout_session_id=%s err=%v", event, checkoutSessionID, err)
		return
	}
	if status == "paid" {
		log.Printf("[SERVICE] sessão já paga (no-op): event=%s checkout_session_id=%s", event, checkoutSessionID)
		return
	}
	log.Printf("[SERVICE] value mismatch ou status inesperado: event=%s checkout_session_id=%s status=%s", event, checkoutSessionID, status)
}
