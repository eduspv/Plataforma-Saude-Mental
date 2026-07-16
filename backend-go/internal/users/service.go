package users

import (
	"backend-go/internal/plans"
	"backend-go/internal/subscriptions"
	"context"
	"errors"
	"net"
	"net/mail"
	"strings"
	"time"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	Repo             *Repository
	SubscriptionRepo *subscriptions.Repository
	PlansRepo        *plans.Repository
}

func NewService(repo *Repository, subsRepo *subscriptions.Repository, plansRepo *plans.Repository) *Service {
	return &Service{
		Repo:             repo,
		SubscriptionRepo: subsRepo,
		PlansRepo:        plansRepo,
	}
}

func (s *Service) RegisterNewEmployee(input *UserInput) (*NewEmployeeResponse, error) {
	if err := s.validateData(input); err != nil {
		return nil, err
	}

	if err := s.CanAddEmployee(input.Auth.CompanyID); err != nil {
		return nil, err
	}

	exists, err := s.Repo.EmailExists(input.Req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, err
	}

	input.Req.Password, err = s.hashPassword(input.Req.Password)
	if err != nil {
		return nil, err
	}

	User := s.NormalizeUserData(*input)
	err = s.Repo.CreateNewUser(&User)
	if err != nil {
		return nil, err
	}
	Response := s.NormalizeResponse(&User)
	return Response, nil
}

func (s *Service) validateData(input *UserInput) error {
	if err := s.validateName(input.Req.Name); err != nil {
		return errors.New("o nome esta no formato incorreto")
	}
	if err := s.validateEmail(input.Req.Email); err != nil {
		return errors.New("o email esta no formato incorreto")
	}
	if err := s.validateCPF(input.Req.Cpf); err != nil {
		return errors.New("o cpf esta no formato incorreto")
	}
	if err := s.validatePassword(input.Req.Password); err != nil {
		return errors.New("a senha esta no formato incorreto")
	}
	if err := s.validateAcceptedTerms(input.Req.AcceptedTerms); err != nil {
		return errors.New("o termo tem que ser aceito")
	}
	if err := s.validateAcceptedTerms(input.Req.AcceptedPrivacyPolicy); err != nil {
		return errors.New("a politica de privacidade tem que ser aceita")
	}

	return nil
}

func (s *Service) validateName(name string) error {
	if name == "" {
		return errors.New("o nome deve ser preenchido")
	}
	if 250 < len(name) && len(name) < 3 {
		return errors.New("O nome tem que ter por exemplo 20 caracteres")
	}
	return nil
}

func (s *Service) validateAcceptedTerms(accterms bool) error {
	if accterms != true {
		return errors.New("os termos devem ser aceitos")
	}
	return nil
}

func (s *Service) validatePassword(password string) error {
	if len(password) < 8 {
		return errors.New("a senha deve ter no mínimo 8 caracteres")
	}

	if strings.Contains(password, " ") {
		return errors.New("a senha não pode conter espaços")
	}

	var hasUpper bool
	var hasLower bool
	var hasNumber bool
	var hasSpecial bool

	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	if !hasUpper {
		return errors.New("a senha deve conter pelo menos uma letra maiúscula")
	}

	if !hasLower {
		return errors.New("a senha deve conter pelo menos uma letra minúscula")
	}

	if !hasNumber {
		return errors.New("a senha deve conter pelo menos um número")
	}

	if !hasSpecial {
		return errors.New("a senha deve conter pelo menos um caractere especial")
	}

	return nil
}

func (s *Service) validateCPF(cpf string) error {
	cpf = strings.TrimSpace(cpf)

	if cpf == "" {
		return errors.New("o CPF não pode estar vazio")
	}

	cpf = strings.NewReplacer(
		".", "",
		"-", "",
		" ", "",
	).Replace(cpf)

	if len(cpf) != 11 {
		return errors.New("o CPF deve possuir 11 dígitos")
	}

	for _, caractere := range cpf {
		if caractere < '0' || caractere > '9' {
			return errors.New("o CPF deve conter apenas números")
		}
	}

	todosIguais := true

	for i := 1; i < len(cpf); i++ {
		if cpf[i] != cpf[0] {
			todosIguais = false
			break
		}
	}

	if todosIguais {
		return errors.New("CPF inválido")
	}

	primeiroDigito := calcularDigitoCPF(cpf[:9], 10)

	if int(cpf[9]-'0') != primeiroDigito {
		return errors.New("CPF inválido")
	}

	segundoDigito := calcularDigitoCPF(cpf[:10], 11)

	if int(cpf[10]-'0') != segundoDigito {
		return errors.New("CPF inválido")
	}

	return nil
}

func (s *Service) validateEmail(email string) error {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" {
		return errors.New("e-mail não informado")
	}

	// Valida a estrutura básica do endereço.
	address, err := mail.ParseAddress(email)
	if err != nil || address.Address != email {
		return errors.New("formato de e-mail inválido")
	}

	domain, err := getEmailDomain(email)
	if err != nil {
		return err
	}

	// Evita que uma falha ou lentidão de DNS bloqueie a aplicação indefinidamente.
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	resolver := net.DefaultResolver

	mxRecords, err := resolver.LookupMX(ctx, domain)
	if err != nil {
		return errors.New("não foi possível verificar o domínio do e-mail")
	}

	if len(mxRecords) == 0 {
		return errors.New("o domínio do e-mail não possui servidor de e-mail válido")
	}

	return nil
}

func (s *Service) CanAddEmployee(companyID string) error {
	planID, err := s.SubscriptionRepo.GetPlanIDFromCompanyID(companyID)
	if err != nil {
		return err
	}

	maxEmployees, err := s.PlansRepo.GetMaxEmployeesByID(planID)
	if err != nil {
		return err
	}

	currentEmployees, err := s.Repo.CountUsersByCompany(companyID)
	if err != nil {
		return err
	}

	if currentEmployees >= maxEmployees {
		return errors.New("a empresa atingiu o limite de funcionários do plano")
	}

	return nil
}

func getEmailDomain(email string) (string, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	atPosition := strings.LastIndex(email, "@")

	if atPosition <= 0 || atPosition == len(email)-1 {
		return "", errors.New("e-mail inválido")
	}

	domain := email[atPosition+1:]

	return domain, nil
}

func calcularDigitoCPF(parteCPF string, pesoInicial int) int {
	soma := 0

	for i := 0; i < len(parteCPF); i++ {
		numero := int(parteCPF[i] - '0')
		peso := pesoInicial - i

		soma += numero * peso
	}

	resto := soma % 11

	if resto < 2 {
		return 0
	}

	return 11 - resto
}

func (s *Service) hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func (s *Service) NormalizeUserData(userInput UserInput) User {
	now := time.Now()
	return User{
		CompanyID:               &userInput.Auth.CompanyID,
		Name:                    userInput.Req.Name,
		Email:                   userInput.Req.Email,
		PasswordHash:            userInput.Req.Password,
		Role:                    RoleEmployee,
		Status:                  UserStatusActive,
		AcceptedTerms:           userInput.Req.AcceptedTerms,
		AcceptedTermsAt:         &now,
		AcceptedPrivacyPolicy:   userInput.Req.AcceptedPrivacyPolicy,
		AcceptedPrivacyPolicyAt: &now,
	}
}

func (s *Service) NormalizeResponse(user *User) *NewEmployeeResponse {
	return &NewEmployeeResponse{
		Name:  user.Name,
		Email: user.Email,
	}
}
