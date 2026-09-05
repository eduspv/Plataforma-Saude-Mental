package dashboard

import (
	"backend-go/internal/assesments/results"
	"backend-go/internal/users"
	"context"
)

type Service struct {
	Repository        *Repository
	UserRepository    *users.Repository
	ResultsRepository *results.Repository
}

func NewService(repository *Repository, userRepository *users.Repository, resultsRepository *results.Repository) *Service {
	return &Service{
		Repository:        repository,
		UserRepository:    userRepository,
		ResultsRepository: resultsRepository,
	}
}

func (s *Service) GettingDashboardData(ctx context.Context, companyID string) (*CompanyDashboardResponse, error) {
	counts, err := s.Repository.CountTestsByClassification(ctx, companyID)
	if err != nil {
		return nil, err
	}

	// as 7 classificações oficiais, na ordem do "melhor" pro "pior"
	allClassifications := []string{
		"apto",
		"apto_com_acompanhamento",
		"necessita_avaliacao_psicologica",
		"necessita_avaliacao_psiquiatrica",
		"necessita_avaliacao_psicologica_psiquiatrica",
		"risco_elevado",
		"risco_critico",
	}

	// 1. TOTAL DE TESTES = soma de todos os valores do mapa
	totalTests := 0
	for _, c := range counts {
		totalTests += c
	}

	// 2. AT RISK = risco_elevado + risco_critico (chave ausente = 0, automático)
	atRisk := counts["risco_elevado"] + counts["risco_critico"]

	// 3. DISTRIBUIÇÃO das 7 (completando zeradas) + PERCENTUAL de cada
	distribution := make([]ClassificationCount, 0, len(allClassifications))
	for _, name := range allClassifications {
		count := counts[name] // se não existe no mapa, Go devolve 0

		var pct float64
		if totalTests > 0 {
			pct = float64(count) / float64(totalTests) * 100
		}

		distribution = append(distribution, ClassificationCount{
			Classification: name,
			Count:          count,
			Percentage:     pct,
		})
	}
	totalEmployees, err := s.UserRepository.CountUsersByCompany(companyID)
	if err != nil {
		return nil, err
	}
	employeeTested, err := s.ResultsRepository.CountEmployeesTested(ctx, companyID)
	if err != nil {
		return nil, err
	}

	return &CompanyDashboardResponse{
		TotalTests:      totalTests,
		AtRiskCount:     atRisk,
		Distribution:    distribution,
		TotalEmployees:  totalEmployees,
		EmployeesTested: employeeTested,
	}, nil
}
