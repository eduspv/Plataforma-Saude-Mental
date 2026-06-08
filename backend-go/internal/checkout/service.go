package checkout

import (
	"backend-go/internal/users"
	"errors"

	"github.com/google/uuid"
)

type Service struct {
	Repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{
		Repository: repository,
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
	plan, err := s.Repository.GetActivePlanByID(input.PlanID)
	if err != nil {
		return nil, err
	}

	// por enquanto só para testar
	return &CheckoutSessionResponse{
		CheckoutSessionID: "",
		CheckoutURL:       "",
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
