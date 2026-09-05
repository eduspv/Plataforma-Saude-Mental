package subscriptions

import (
	"context"
	"fmt"
	"time"

	"backend-go/internal/plans"

	"github.com/jackc/pgx/v5"
)

type Service struct {
	Repo      *Repository
	PlansRepo *plans.Repository
}

func NewService(repo *Repository, plansRepo *plans.Repository) *Service {
	return &Service{Repo: repo, PlansRepo: plansRepo}
}

// ActivateFromPaymentTx é chamada DENTRO da transação do webhook, logo depois
// de o payment ser criado. Nunca deve ser chamada em caminho de duplicata.
func (s *Service) ActivateFromPaymentTx(ctx context.Context, tx pgx.Tx, in ActivateFromPaymentInput) error {
	plan, err := s.PlansRepo.GetByIDTx(ctx, tx, in.PlanID)
	if err != nil {
		return fmt.Errorf("ler plano: %w", err)
	}

	active, err := s.Repo.GetActiveByCompanyIDTx(ctx, tx, in.CompanyID)
	if err != nil {
		return fmt.Errorf("buscar subscription ativa: %w", err)
	}

	base := calculatePeriodBase(active, time.Now())
	end, err := calculatePeriodEnd(base, plan.BillingCycle)
	if err != nil {
		return err
	}

	if active != nil {
		if err := s.Repo.ExpireTx(ctx, tx, active.ID); err != nil {
			return fmt.Errorf("expirar subscription anterior: %w", err)
		}
	}

	provider := "asaas"
	_, err = s.Repo.CreateTx(ctx, tx, CreateSubscriptionInput{
		CompanyID:          in.CompanyID,
		PlanID:             in.PlanID,
		LastPaymentID:      &in.PaymentID,
		Provider:           &provider,
		CurrentPeriodStart: base,
		CurrentPeriodEnd:   end,
	})
	if err != nil {
		return fmt.Errorf("criar nova subscription: %w", err)
	}

	return nil
}

// calculatePeriodBase decide de onde o novo período começa.
// Regra: se existe assinatura ativa que ainda não venceu, soma na data existente
// (não perde os dias que sobravam). Caso contrário, começa de agora.
// Vale para qualquer billing_cycle — a base não muda por ciclo.
func calculatePeriodBase(active *Subscription, now time.Time) time.Time {
	if active != nil && active.CurrentPeriodEnd != nil && active.CurrentPeriodEnd.After(now) {
		return *active.CurrentPeriodEnd
	}
	return now
}

// calculatePeriodEnd consulta o map de ciclos e aplica o cálculo correspondente.
// Se o billing_cycle não existir no map, retorna erro (fail-closed).
func calculatePeriodEnd(base time.Time, cycle string) (time.Time, error) {
	calc, ok := periodEndByCycle[cycle]
	if !ok {
		return time.Time{}, fmt.Errorf("billing_cycle inválido: %s", cycle)
	}
	return calc(base), nil
}
