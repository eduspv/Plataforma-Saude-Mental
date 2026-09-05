package auth

import (
	"backend-go/internal/users"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

func (s *Service) Login(input LoginRequest) (*LoginResponse, error) {
	if err := s.validateLoginData(input); err != nil {
		return nil, err
	}
	exists, err := s.Repository.EmailExists(input.Email)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, errors.New("o email não esta cadastrado no banco de dados")
	}
	hashedPw, err := s.Repository.GetPasswordHashByEmail(input.Email)
	if err != nil {
		return nil, err
	}
	Match, err := s.PasswordsMatch(input.Password, hashedPw)
	if err != nil {
		return nil, err
	}
	if !Match {
		return nil, errors.New("a senha não é a mesma do banco de dados")
	}
	jwtData, err := s.GettingJWTData(input.Email)
	if err != nil {
		return nil, err
	}
	JWT, err := s.generateJWT(*jwtData)
	if err != nil {
		return nil, err
	}

	companyStatus, err := s.CompanyRepo.GettingCompanyStatusFromID(jwtData.CompanyID)
	if err != nil {
		return nil, err
	}
	nextStep := s.nextStep(jwtData.Role, jwtData.Status)
	return &LoginResponse{
		CompanyID:     jwtData.CompanyID,
		UserID:        jwtData.UserID,
		UserStatus:    jwtData.Status,
		Role:          jwtData.Role,
		CompanyStatus: companyStatus,
		NextStep:      nextStep,
		Token:         JWT,
	}, nil
}

func (s *Service) GettingJWTData(email string) (*JWTData, error) {
	jwtData := &JWTData{}
	userID, err := s.UserRepo.GettingUserIdFromEmail(email)
	if err != nil {
		return nil, err
	}
	jwtData.UserID = userID
	CompanyID, err := s.UserRepo.GettingCompanyIdFromEmail(email)
	if err != nil {
		return nil, err
	}
	jwtData.CompanyID = CompanyID
	status, err := s.UserRepo.GettingUserStatusFromID(userID)
	if err != nil {
		return nil, err
	}
	jwtData.Status = status
	role, err := s.UserRepo.GettingUserRoleFromID(userID)
	if err != nil {
		return nil, err
	}
	jwtData.Role = role
	return jwtData, nil

}

func (s *Service) validateLoginData(input LoginRequest) error {
	if err := s.validatePassword(input.Password); err != nil {
		return err
	}
	if err := s.validateEmail(input.Email); err != nil {
		return err
	}
	if err := s.validateEmailFormat(input.Email); err != nil {
		return err
	}
	return nil
}
func (s *Service) validateEmail(email string) error {
	if email == "" {
		return errors.New("o campo do email não pode estar vazio")
	}

	return nil
}

func (s *Service) validateEmailFormat(email string) error {
	email = strings.TrimSpace(email)

	if email == "" {
		return errors.New("o e-mail não pode estar vazio")
	}

	if len(email) > 254 {
		return errors.New("o e-mail é muito longo")
	}

	address, err := mail.ParseAddress(email)
	if err != nil {
		return errors.New("formato de e-mail inválido")
	}

	if address.Address != email {
		return errors.New("formato de e-mail inválido")
	}

	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return errors.New("formato de e-mail inválido")
	}

	localPart := parts[0]
	domain := parts[1]

	if localPart == "" || domain == "" {
		return errors.New("formato de e-mail inválido")
	}

	if len(localPart) > 64 {
		return errors.New("a parte anterior ao @ é muito longa")
	}

	if !strings.Contains(domain, ".") {
		return errors.New("o domínio do e-mail é inválido")
	}

	if strings.HasPrefix(domain, ".") || strings.HasSuffix(domain, ".") {
		return errors.New("o domínio do e-mail é inválido")
	}

	if strings.Contains(domain, "..") {
		return errors.New("o domínio do e-mail é inválido")
	}

	return nil
}

func (s *Service) PasswordsMatch(password, hashedPassword string) (bool, error) {
	err := bcrypt.CompareHashAndPassword(
		[]byte(hashedPassword),
		[]byte(password),
	)

	if err == nil {
		return true, nil
	}

	if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
		return false, nil
	}

	return false, fmt.Errorf("erro ao comparar senha: %w", err)
}

// melhorar essa parte do codigo pensar numa logica melhor
func (s *Service) nextStep(role, status string) string {
	if role == users.RoleSystemAdmin {
		return "system_admin_dashboard"
	}
	if role == users.RoleCompanyAdmin {
		if status == users.UserStatusActive {
			return "company_admin_dashboard"
		}
		return "plan_selection"
	}
	return "home"
}
