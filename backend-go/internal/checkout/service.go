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

func (s *Service) checkoutMethods() CheckoutBillingTypes {
	return CheckoutBillingTypes{
		BillingMethods: map[BillingType]Checkout{
			BillingTypePix:        s.RegisterPIXCheckoutSession,
			BillingTypeBoleto:     s.RegisterBoletoCheckoutSession,
			BillingTypeCreditCard: s.RegisterCreditCardCheckoutSession,
			BillingTypeUndefined:  s.RegisterUndefinedCheckoutSession,
		},
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

	billingMethods := s.checkoutMethods()

	return s.ServeFromBillingType(
		input.BillingType,
		input,
		plan,
		billingMethods,
	)
}

func (s *Service) RegisterPIXCheckoutSession(input CreateCheckoutSessionInput, plan *plans.Plan) (*CheckoutSessionResponse, error) {
	checkoutSession := s.NormalizeCheckoutSessionData(input, plan)

	checkoutSession, err := s.Repository.CreateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	body := s.gettingPaymentLinkData(checkoutSession, plan)

	paymentResponse, err := s.Api.GettingPaymentLink(body)
	if err != nil {
		return nil, err
	}

	checkoutURL := paymentResponse.URL
	checkoutSession.CheckoutURL = &checkoutURL

	// Se sua resposta do Asaas tiver ID, use isso:
	// providerSessionID := paymentResponse.ID
	// checkoutSession.ProviderSessionID = &providerSessionID

	checkoutSession, err = s.Repository.UpdateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	return &CheckoutSessionResponse{
		CheckoutSessionID: checkoutSession.ID,
		CheckoutURL:       paymentResponse.URL,
		Status:            checkoutSession.Status,
		AmountCents:       plan.PriceCents,
		Currency:          plan.Currency,
	}, nil
}

func (s *Service) RegisterBoletoCheckoutSession(input CreateCheckoutSessionInput, plan *plans.Plan) (*CheckoutSessionResponse, error) {
	return nil, errors.New("checkout por boleto ainda não implementado")
}

func (s *Service) RegisterCreditCardCheckoutSession(input CreateCheckoutSessionInput, plan *plans.Plan) (*CheckoutSessionResponse, error) {
	return nil, errors.New("checkout por cartão ainda não implementado")
}
func (s *Service) RegisterUndefinedCheckoutSession(input CreateCheckoutSessionInput, plan *plans.Plan) (*CheckoutSessionResponse, error) {
	return nil, errors.New("checkout multiplo ainda não implementado")
}

// /////////////////////////////////////Validações///////////////////////////////////////////////////
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

func (s *Service) ServeFromBillingType(billingType BillingType, input CreateCheckoutSessionInput, plan *plans.Plan, billingMethods CheckoutBillingTypes) (*CheckoutSessionResponse, error) {
	checkout, exists := billingMethods.BillingMethods[billingType]
	if !exists {
		return nil, errors.New("método de pagamento não implementado")
	}

	return checkout(input, plan)
}
