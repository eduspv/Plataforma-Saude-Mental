package dashboard

type Service struct {
}

func NewService() *Service {
	return &Service{}
}

func (s *Service) GettingDAshboardData(input AuthContext) bool {
	return false
}

func (s *Service) ValidateData() {

}
