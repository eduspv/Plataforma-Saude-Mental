package plans

import "context"

type Service struct {
	Repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{
		Repo: repo,
	}
}

func (s *Service) GettingAllPLans(ctx context.Context) ([]Plan, error) {
	Plans, err := s.Repo.ListActivePlans(ctx)
	if err != nil {
		return nil, err
	}

	return Plans, nil
}
