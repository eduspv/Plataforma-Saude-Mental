package checkout

import (
	"backend-go/internal/plans"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
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
			due_date_limit_days,
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
		&plan.DueDateLimitDays,
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
			currency,
			external_reference,
			description,
			due_date_limit_days,
			max_installment_count,
			subscription_cycle,
			end_date,
			notification_enabled,
			is_address_required,
			success_url,
			cancel_url,
			expired_url,
			provider_request,
			provider_response
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9,
			$10, $11, $12, $13, $14, $15, $16, $17,
			$18, $19, $20, $21, $22
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
			external_reference,
			description,
			due_date_limit_days,
			max_installment_count,
			subscription_cycle,
			end_date,
			notification_enabled,
			is_address_required,
			success_url,
			cancel_url,
			expired_url,
			provider_request,
			provider_response,
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
		checkoutSession.ExternalReference,
		checkoutSession.Description,
		checkoutSession.DueDateLimitDays,
		checkoutSession.MaxInstallmentCount,
		checkoutSession.SubscriptionCycle,
		checkoutSession.EndDate,
		checkoutSession.NotificationEnabled,
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
		&createdCheckoutSession.ExternalReference,
		&createdCheckoutSession.Description,
		&createdCheckoutSession.DueDateLimitDays,
		&createdCheckoutSession.MaxInstallmentCount,
		&createdCheckoutSession.SubscriptionCycle,
		&createdCheckoutSession.EndDate,
		&createdCheckoutSession.NotificationEnabled,
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
			external_reference = $12,
			description = $13,
			due_date_limit_days = $14,
			max_installment_count = $15,
			subscription_cycle = $16,
			end_date = $17,
			notification_enabled = $18,
			is_address_required = $19,
			success_url = $20,
			cancel_url = $21,
			expired_url = $22,
			provider_request = $23,
			provider_response = $24,
			expires_at = $25,
			paid_at = $26,
			failed_at = $27,
			failure_reason = $28,
			updated_at = NOW()
		WHERE id = $29
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
			external_reference,
			description,
			due_date_limit_days,
			max_installment_count,
			subscription_cycle,
			end_date,
			notification_enabled,
			is_address_required,
			success_url,
			cancel_url,
			expired_url,
			provider_request,
			provider_response,
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
		checkoutSession.ExternalReference,
		checkoutSession.Description,
		checkoutSession.DueDateLimitDays,
		checkoutSession.MaxInstallmentCount,
		checkoutSession.SubscriptionCycle,
		checkoutSession.EndDate,
		checkoutSession.NotificationEnabled,
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
		&updatedCheckoutSession.ExternalReference,
		&updatedCheckoutSession.Description,
		&updatedCheckoutSession.DueDateLimitDays,
		&updatedCheckoutSession.MaxInstallmentCount,
		&updatedCheckoutSession.SubscriptionCycle,
		&updatedCheckoutSession.EndDate,
		&updatedCheckoutSession.NotificationEnabled,
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

func (r *Repository) CountPendingCheckoutSessionsByCompany(companyID string) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM checkout_sessions
		WHERE company_id = $1
		AND status = $2
	`

	var count int

	err := r.DB.QueryRow(
		context.Background(),
		query,
		companyID,
		CheckoutStatusPending,
	).Scan(&count)

	if err != nil {
		return 0, err
	}

	return count, nil
}
