package checkout

import (
	"backend-go/internal/plans"
	"backend-go/internal/users"
	"errors"
	"log"

	"github.com/google/uuid"
)

type Service struct {
	Repository *Repository
	Api        *APIClient
}

func NewService(repository *Repository, api *APIClient) *Service {
	return &Service{
		Repository: repository,
		Api:        api,
	}
}

func (s *Service) RegisterCheckoutSession(input CreateCheckoutSessionInput) (*CheckoutSessionResponse, error) {
	if err := s.validatePlanID(input.PlanID); err != nil {
		return nil, err
	}
	if err := s.validateJWTContextID(input); err != nil {
		return nil, err
	}
	if err := s.validateUserCanStartCheckout(input.Auth.Status); err != nil {
		return nil, err
	}
	if err := s.validateRole(input.Auth.Role); err != nil {
		return nil, err
	}
	if err := s.validateBillingType(input.BillingType); err != nil {
		return nil, err
	}
	if err := s.validateChargeType(input.ChargeType); err != nil {
		return nil, err
	}
	plan, err := s.Repository.GetActivePlanByID(input.PlanID)
	if err != nil {
		return nil, err
	}

	checkoutSession := s.NormalizeCheckoutSessionData(input, plan)
	checkoutSession, err = s.Repository.CreateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	body := s.gettingPaymentLinkData(checkoutSession, plan)
	log.Print("Esse é o metodo de pagamento: ", body.BillingType)
	log.Print("Esta vindo o: ", body.DueDateLimitDays)
	PaymentResponse, err := s.Api.GettingPaymentLink(body)
	if err != nil {
		return nil, err
	}

	checkoutSession, err = s.Repository.UpdateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	// por enquanto só para testar
	return &CheckoutSessionResponse{
		CheckoutSessionID: checkoutSession.ID,
		CheckoutURL:       PaymentResponse.URL,
		Status:            "pending",
		AmountCents:       plan.PriceCents,
		Currency:          plan.Currency,
	}, nil
}

func (s *Service) validatePlanID(planID string) error {
	if planID == "" {
		return errors.New("o id do plano é obrigatório")
	}
	if _, err := uuid.Parse(planID); err != nil {
		return errors.New("formato do id do plano inválido")
	}
	return nil
}

func (s *Service) validateBillingType(billingType BillingType) error {
	log.Print("O tipo de pagamento que esta vindo: ", billingType)
	if billingType == BillingTypeBoleto ||
		billingType == BillingTypeCreditCard ||
		billingType == BillingTypePix ||
		billingType == BillingTypeUndefined {
		return nil
	}

	return errors.New("o tipo de pagamento não existe")
}

func (s *Service) validateChargeType(chargeType ChargeType) error {
	if chargeType == ChargeTypeDetached ||
		chargeType == ChargeTypeInstallment ||
		chargeType == ChargeTypeRecurrent {
		return nil
	}

	return errors.New("a frequência de pagamento não existe")
}

func (s *Service) validateJWTContextID(input CreateCheckoutSessionInput) error {
	if input.Auth.CompanyID == "" || input.Auth.UserID == "" {
		return errors.New("os ids estão vazios")
	}
	if _, err := uuid.Parse(input.Auth.CompanyID); err != nil {
		return errors.New("id inválido")
	}
	if _, err := uuid.Parse(input.Auth.UserID); err != nil {
		return errors.New("id inválido")
	}
	return nil
}

func (s *Service) validateRole(role string) error {
	if role != users.RoleCompanyAdmin {
		return errors.New("usuário não tem permissão para contratar plano")
	}
	return nil
}

func (s *Service) validateUserCanStartCheckout(status string) error {
	if status == users.UserStatusPendingPlanSelection ||
		status == users.UserStatusPendingPayment ||
		status == users.UserStatusInactive {
		return nil
	}

	return errors.New("usuário não pode iniciar checkout nesse status")
}

func (s *Service) gettingPaymentLinkData(ck *CheckoutSession, plan *plans.Plan) *CreatePaymentLink {
	return &CreatePaymentLink{
		Name:              plan.Name,
		Value:             float64(ck.AmountCents) / 100,
		BillingType:       ck.BillingType,
		ChargeType:        ck.ChargeType,
		ExternalReference: ck.ID,
	}
}

func (s *Service) NormalizeCheckoutSessionData(input CreateCheckoutSessionInput, plan *plans.Plan) *CheckoutSession {
	return &CheckoutSession{
		UserID:      input.Auth.UserID,
		CompanyID:   input.Auth.CompanyID,
		PlanID:      input.PlanID,
		Provider:    CheckoutProviderAsaas,
		BillingType: input.BillingType,
		ChargeType:  input.ChargeType,
		Status:      CheckoutStatusPending,
		AmountCents: plan.PriceCents,
		Currency:    plan.Currency,
	}
}
