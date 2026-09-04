package companies

import (
	"backend-go/internal/payments"
	"backend-go/internal/plans"
	"backend-go/internal/subscriptions"
	"backend-go/internal/users"
	"context"
	"log"
)

type Service struct {
	Repository       *Repository
	SubscriptionRepo *subscriptions.Repository
	PlansRepo        *plans.Repository
	PaymentsRepo     *payments.Repository
	UserRepo         *users.Repository
}

func NewService(repository *Repository, subscriptionRepo *subscriptions.Repository, plansRepo *plans.Repository, paymentsRepo *payments.Repository, userRepo *users.Repository) *Service {
	return &Service{
		Repository:       repository,
		SubscriptionRepo: subscriptionRepo,
		PlansRepo:        plansRepo,
		PaymentsRepo:     paymentsRepo,
		UserRepo:         userRepo,
	}
}

func (s *Service) GetCompanyProfileData(ctx context.Context, companyID string) (*CompanyProfileResponse, error) {
	profileData, err := s.Repository.GetCompanyProfileData(ctx, companyID)
	if err != nil {
		return nil, err
	}
	return profileData, nil
}

func (s *Service) GetCompanyPlanDashboardData(ctx context.Context, companyID string) (*CompanyPlanDashboardResponse, error) {
	planID, err := s.SubscriptionRepo.GetPlanIDFromCompanyID(companyID)
	if err != nil {
		log.Print("erro na tentativa de pegar o planID: ", err)
		return nil, err
	}
	planData, err := s.PlansRepo.GetPlanDashboardData(ctx, planID)
	if err != nil {
		log.Print("erro na tentativa de juntar os dados do dashboard: ", err)
		return nil, err
	}
	paymentMethod, err := s.PaymentsRepo.GetPaymentMethodByPlanID(ctx, planID, companyID)
	if err != nil {
		log.Print("erro na tentativa de pegar o paymentMethod: ", err)
		return nil, err
	}
	usersAmount, err := s.UserRepo.CountUsersByCompany(companyID)
	if err != nil {
		return nil, err
	}
	return &CompanyPlanDashboardResponse{
		Name:          planData.Name,
		MaxEmployees:  planData.MaxEmployees,
		PriceCents:    planData.PriceCents,
		Currency:      planData.Currency,
		BillingCycle:  planData.BillingCycle,
		PaymentMethod: paymentMethod,
		UsersAmount:   usersAmount,
	}, nil

}

func (s *Service) CompanyPaymentHistory(ctx context.Context, companyID string) (*PaymentHistoryResponse, error) {
	// Regra de negócio: sem assinatura ativa, não mostra histórico — propaga o erro.
	planID, err := s.SubscriptionRepo.GetPlanIDFromCompanyID(companyID)
	if err != nil {
		log.Print("erro na tentativa de pegar o planID: ", err)
		return nil, err
	}

	planData, err := s.PlansRepo.GetPlanDashboardData(ctx, planID)
	if err != nil {
		log.Print("erro na tentativa de pegar os dados do plano: ", err)
		return nil, err
	}

	rows, err := s.PaymentsRepo.ListPaidByCompany(ctx, companyID)
	if err != nil {
		return nil, err
	}

	summary, err := s.PaymentsRepo.SummaryByCompany(ctx, companyID)
	if err != nil {
		return nil, err
	}

	// payment_method do summary = pagamento mais recente da própria empresa
	// (ListPaidByCompany já vem ordenado por paid_at DESC).
	var paymentMethod string
	if len(rows) > 0 {
		paymentMethod = rows[0].PaymentMethod
	}

	items := make([]Payments, 0, len(rows))
	for _, p := range rows {
		items = append(items, Payments{
			ID:            p.ID,
			DueDate:       p.PaidAt, // sem vencimento próprio no MVP; espelha paid_at
			PaidAt:        p.PaidAt,
			AmountCents:   int(p.AmountCents),
			Currency:      p.Currency,
			PaymentMethod: p.PaymentMethod,
			Status:        p.Status,
		})
	}

	return &PaymentHistoryResponse{
		Summary: Summary{
			TotalPaidCents:         int(summary.TotalPaidCents),
			Currency:               summary.Currency,
			CurrentPlanAmountCents: planData.PriceCents,
			PaymentMethod:          paymentMethod,
			NextDueDate:            nil, // backlog
		},
		Payments: items,
	}, nil
}
