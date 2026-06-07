package auth

type Service struct {
	Repository *Repository
	Api        *APIClient
	JWTSecret  string
}

func NewService(repository *Repository, api *APIClient, jwtSecret string) *Service {
	return &Service{
		Repository: repository,
		Api:        api,
		JWTSecret:  jwtSecret,
	}
}
