package checkout

import (
	"backend-go/internal/plans"
	"context"
	"errors"

	"github.com/jackc/pgx"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		DB: db,
	}
}

func (r *Repository) GetActivePlanByID(planID string) (*plans.Plan, error) {
	query := `
		SELECT
			id,
			name,
			COALESCE(description, ''),
			price_cents,
			currency,
			billing_cycle,
			max_employees,
			is_active
		FROM plans
		WHERE id = $1
		AND is_active = true
	`

	var plan plans.Plan

	err := r.DB.QueryRow(
		context.Background(),
		query,
		planID,
	).Scan(
		&plan.ID,
		&plan.Name,
		&plan.Description,
		&plan.PriceCents,
		&plan.Currency,
		&plan.BillingCycle,
		&plan.MaxEmployees,
		&plan.IsActive,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("plano não encontrado ou inativo")
		}

		return nil, err
	}

	return &plan, nil
}

func (r *Repository) CreateCheckoutSession(checkoutSession *CheckoutSession) (*CheckoutSession, error) {
	query := `
		INSERT INTO checkout_sessions (
			user_id,
			company_id,
			plan_id,
			provider,
			billing_type,
			charge_type,
			status,
			amount_cents,
			currency
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9
		)
		RETURNING
			id,
			user_id,
			company_id,
			plan_id,
			provider,
			provider_session_id,
			billing_type,
			charge_type,
			status,
			amount_cents,
			currency,
			checkout_url,
			expires_at,
			paid_at,
			failed_at,
			failure_reason,
			created_at,
			updated_at
	`

	var createdCheckoutSession CheckoutSession

	err := r.DB.QueryRow(
		context.Background(),
		query,
		checkoutSession.UserID,
		checkoutSession.CompanyID,
		checkoutSession.PlanID,
		checkoutSession.Provider,
		checkoutSession.BillingType,
		checkoutSession.ChargeType,
		checkoutSession.Status,
		checkoutSession.AmountCents,
		checkoutSession.Currency,
	).Scan(
		&createdCheckoutSession.ID,
		&createdCheckoutSession.UserID,
		&createdCheckoutSession.CompanyID,
		&createdCheckoutSession.PlanID,
		&createdCheckoutSession.Provider,
		&createdCheckoutSession.ProviderSessionID,
		&createdCheckoutSession.BillingType,
		&createdCheckoutSession.ChargeType,
		&createdCheckoutSession.Status,
		&createdCheckoutSession.AmountCents,
		&createdCheckoutSession.Currency,
		&createdCheckoutSession.CheckoutURL,
		&createdCheckoutSession.ExpiresAt,
		&createdCheckoutSession.PaidAt,
		&createdCheckoutSession.FailedAt,
		&createdCheckoutSession.FailureReason,
		&createdCheckoutSession.CreatedAt,
		&createdCheckoutSession.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &createdCheckoutSession, nil
}

func (r *Repository) UpdateCheckoutSession(checkoutSession *CheckoutSession) (*CheckoutSession, error) {
	query := `
		UPDATE checkout_sessions
		SET
			user_id = $1,
			company_id = $2,
			plan_id = $3,
			provider = $4,
			provider_session_id = $5,
			billing_type = $6,
			charge_type = $7,
			status = $8,
			amount_cents = $9,
			currency = $10,
			checkout_url = $11,
			expires_at = $12,
			paid_at = $13,
			failed_at = $14,
			failure_reason = $15,
			updated_at = NOW()
		WHERE id = $16
		RETURNING
			id,
			user_id,
			company_id,
			plan_id,
			provider,
			provider_session_id,
			billing_type,
			charge_type,
			status,
			amount_cents,
			currency,
			checkout_url,
			expires_at,
			paid_at,
			failed_at,
			failure_reason,
			created_at,
			updated_at
	`

	var updatedCheckoutSession CheckoutSession

	err := r.DB.QueryRow(
		context.Background(),
		query,
		checkoutSession.UserID,
		checkoutSession.CompanyID,
		checkoutSession.PlanID,
		checkoutSession.Provider,
		checkoutSession.ProviderSessionID,
		checkoutSession.BillingType,
		checkoutSession.ChargeType,
		checkoutSession.Status,
		checkoutSession.AmountCents,
		checkoutSession.Currency,
		checkoutSession.CheckoutURL,
		checkoutSession.ExpiresAt,
		checkoutSession.PaidAt,
		checkoutSession.FailedAt,
		checkoutSession.FailureReason,
		checkoutSession.ID,
	).Scan(
		&updatedCheckoutSession.ID,
		&updatedCheckoutSession.UserID,
		&updatedCheckoutSession.CompanyID,
		&updatedCheckoutSession.PlanID,
		&updatedCheckoutSession.Provider,
		&updatedCheckoutSession.ProviderSessionID,
		&updatedCheckoutSession.BillingType,
		&updatedCheckoutSession.ChargeType,
		&updatedCheckoutSession.Status,
		&updatedCheckoutSession.AmountCents,
		&updatedCheckoutSession.Currency,
		&updatedCheckoutSession.CheckoutURL,
		&updatedCheckoutSession.ExpiresAt,
		&updatedCheckoutSession.PaidAt,
		&updatedCheckoutSession.FailedAt,
		&updatedCheckoutSession.FailureReason,
		&updatedCheckoutSession.CreatedAt,
		&updatedCheckoutSession.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &updatedCheckoutSession, nil
}
