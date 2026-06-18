package checkout

import (
	"backend-go/internal/plans"
	"backend-go/internal/users"
	"errors"
	"log"
	"time"

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

	if err := s.ValidatePendingCheckoutSessions(input.Auth.CompanyID); err != nil {
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
	checkoutSession.NotificationEnabled = s.validateNotificationsEnabled(checkoutSession.NotificationEnabled)

	checkoutSession, err := s.Repository.CreateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	body := s.getPixPaymentLinkData(checkoutSession, plan)
	log.Printf("BODY ASAAS PIX: %+v", body)

	paymentResponse, err := s.Api.GettingPaymentLink(body)
	if err != nil {
		s.deleteCheckoutSessionAfterAsaasError(checkoutSession.ID)
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
		Value:             plan.PriceCents,
		Currency:          plan.Currency,
	}, nil
}
func (s *Service) RegisterCreditCardCheckoutSession(input CreateCheckoutSessionInput, plan *plans.Plan) (*CheckoutSessionResponse, error) {
	log.Print("PRIMEIRA APARIÇÃO DO END_DATE: ", input.EndDate)
	checkoutSession := s.NormalizeCheckoutSessionData(input, plan)
	checkoutSession.NotificationEnabled = s.validateNotificationsEnabled(checkoutSession.NotificationEnabled)

	checkoutSession, err := s.validateCreditCardForBd(checkoutSession)
	if err != nil {
		return nil, err
	}

	checkoutSession, err = s.Repository.CreateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	body := s.getCreditCardPaymentLinkData(checkoutSession, plan)

	paymentResponse, err := s.Api.GettingPaymentLink(body)
	if err != nil {
		s.deleteCheckoutSessionAfterAsaasError(checkoutSession.ID)
		return nil, err
	}

	checkoutURL := paymentResponse.URL
	checkoutSession.CheckoutURL = &checkoutURL

	checkoutSession, err = s.Repository.UpdateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	return &CheckoutSessionResponse{
		CheckoutSessionID: checkoutSession.ID,
		CheckoutURL:       paymentResponse.URL,
		Status:            checkoutSession.Status,
		Value:             plan.PriceCents,
		Currency:          plan.Currency,
	}, nil
}

func (s *Service) RegisterBoletoCheckoutSession(input CreateCheckoutSessionInput, plan *plans.Plan) (*CheckoutSessionResponse, error) {
	checkoutSession := s.NormalizeCheckoutSessionData(input, plan)
	checkoutSession.NotificationEnabled = s.validateNotificationsEnabled(checkoutSession.NotificationEnabled)

	checkoutSession, err := s.validateBoletoForBd(checkoutSession)
	if err != nil {
		return nil, err
	}

	checkoutSession, err = s.Repository.CreateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	body := s.getBoletoPaymentLinkData(checkoutSession, plan)

	paymentResponse, err := s.Api.GettingPaymentLink(body)
	if err != nil {
		s.deleteCheckoutSessionAfterAsaasError(checkoutSession.ID)
		return nil, err
	}

	checkoutURL := paymentResponse.URL
	checkoutSession.CheckoutURL = &checkoutURL

	checkoutSession, err = s.Repository.UpdateCheckoutSession(checkoutSession)
	if err != nil {
		return nil, err
	}

	return &CheckoutSessionResponse{
		CheckoutSessionID: checkoutSession.ID,
		CheckoutURL:       paymentResponse.URL,
		Status:            checkoutSession.Status,
		Value:             plan.PriceCents,
		Currency:          plan.Currency,
	}, nil
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
		billingType == BillingTypePix {
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
func (s *Service) deleteCheckoutSessionAfterAsaasError(checkoutSessionID string) {
	err := s.Repository.DeleteCheckoutSessionByID(checkoutSessionID)
	if err != nil {
		log.Printf("erro ao apagar checkout session após falha no Asaas: %v", err)
	}
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

func (s *Service) getPixPaymentLinkData(ck *CheckoutSession, plan *plans.Plan) *CreatePaymentLink {
	return &CreatePaymentLink{
		Name:                plan.Name,
		Value:               float64(ck.AmountCents) / 100,
		BillingType:         ck.BillingType,
		ChargeType:          ck.ChargeType,
		ExternalReference:   ck.ID,
		DueDateLimitDays:    int32Ptr(1),
		NotificationEnabled: &ck.NotificationEnabled,
	}
}
func (s *Service) getBoletoPaymentLinkData(ck *CheckoutSession, plan *plans.Plan) *CreatePaymentLink {
	return &CreatePaymentLink{
		Name:                plan.Name,
		Value:               float64(ck.AmountCents) / 100,
		BillingType:         ck.BillingType,
		ChargeType:          ck.ChargeType,
		ExternalReference:   ck.ID,
		NotificationEnabled: &ck.NotificationEnabled,
		DueDateLimitDays:    ck.DueDateLimitDays,
	}
}

func (s *Service) getCreditCardPaymentLinkData(ck *CheckoutSession, plan *plans.Plan) *CreatePaymentLink {
	endDate := ""
	if ck.EndDate != nil {
		endDate = ck.EndDate.Format("2006-01-02")
	}

	var subscriptionCycle SubscriptionCycle
	if ck.SubscriptionCycle != nil {
		subscriptionCycle = SubscriptionCycle(*ck.SubscriptionCycle)
	}

	return &CreatePaymentLink{
		Name:                plan.Name,
		Value:               float64(ck.AmountCents) / 100,
		BillingType:         ck.BillingType,
		ChargeType:          ck.ChargeType,
		ExternalReference:   ck.ID,
		NotificationEnabled: &ck.NotificationEnabled,

		EndDate:             endDate,
		SubscriptionCycle:   subscriptionCycle,
		MaxInstallmentCount: ck.MaxInstallmentCount,
		DueDateLimitDays:    ck.DueDateLimitDays,
	}
}

func (s *Service) NormalizeCheckoutSessionData(input CreateCheckoutSessionInput, plan *plans.Plan) *CheckoutSession {
	var endDate *time.Time
	var subscriptionCycle *string

	log.Printf("NormalizeCheckoutSessionData - input.EndDate recebido: '%s'", input.EndDate)
	log.Printf("NormalizeCheckoutSessionData - input.SubscriptionCycle recebido: '%s'", input.SubscriptionCycle)

	if input.EndDate != "" {
		parsedEndDate, err := time.Parse("2006-01-02", input.EndDate)
		if err != nil {
			log.Printf("NormalizeCheckoutSessionData - erro ao converter end_date: %v", err)
		} else {
			endDate = &parsedEndDate
			log.Printf("NormalizeCheckoutSessionData - endDate convertido com sucesso: %v", parsedEndDate)
		}
	} else {
		log.Println("NormalizeCheckoutSessionData - input.EndDate veio vazio")
	}

	if input.SubscriptionCycle != "" {
		cycle := string(input.SubscriptionCycle)
		subscriptionCycle = &cycle
		log.Printf("NormalizeCheckoutSessionData - subscriptionCycle definido: %s", cycle)
	} else {
		log.Println("NormalizeCheckoutSessionData - subscriptionCycle ficará NULL")
	}

	if endDate == nil {
		log.Println("NormalizeCheckoutSessionData - endDate final está NIL")
	} else {
		log.Printf("NormalizeCheckoutSessionData - endDate final: %v", *endDate)
	}

	return &CheckoutSession{
		UserID:              input.Auth.UserID,
		CompanyID:           input.Auth.CompanyID,
		PlanID:              input.PlanID,
		Provider:            CheckoutProviderAsaas,
		BillingType:         input.BillingType,
		ChargeType:          input.ChargeType,
		Status:              CheckoutStatusPending,
		AmountCents:         plan.PriceCents,
		Currency:            plan.Currency,
		DueDateLimitDays:    input.DueDateLimitDays,
		MaxInstallmentCount: input.MaxInstallmentCount,
		SubscriptionCycle:   subscriptionCycle,
		EndDate:             endDate,
		NotificationEnabled: false,
	}
}

func (s *Service) ServeFromBillingType(billingType BillingType, input CreateCheckoutSessionInput, plan *plans.Plan, billingMethods CheckoutBillingTypes) (*CheckoutSessionResponse, error) {
	checkout, exists := billingMethods.BillingMethods[billingType]
	if !exists {
		return nil, errors.New("método de pagamento não implementado")
	}

	return checkout(input, plan)
}

func (s *Service) ValidatePendingCheckoutSessions(CompanyID string) error {
	count, err := s.Repository.CountPendingCheckoutSessionsByCompany(CompanyID)
	if err != nil {
		return err
	}

	if count >= 4 {
		return errors.New("não é possível criar outro link de pagamento; utilize um dos links enviados anteriormente")
	}
	return nil
}

func (s *Service) validateNotificationsEnabled(notificationsEnabled bool) bool {
	if notificationsEnabled != false {
		notificationsEnabled = false
	}
	return notificationsEnabled
}

func int32Ptr(value int32) *int32 {
	return &value
}
