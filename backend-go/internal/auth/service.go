package auth

import (
	"backend-go/internal/companies"
	"backend-go/internal/users"
)

type Service struct {
	Repository  *Repository
	UserRepo    *users.Repository
	CompanyRepo *companies.Repository
	Api         *APIClient
	JWTSecret   string
}

func NewService(repository *Repository, userRepo *users.Repository, companyRepo *companies.Repository, api *APIClient, jwtSecret string) *Service {
	return &Service{
		Repository:  repository,
		UserRepo:    userRepo,
		CompanyRepo: companyRepo,
		Api:         api,
		JWTSecret:   jwtSecret,
	}
}
