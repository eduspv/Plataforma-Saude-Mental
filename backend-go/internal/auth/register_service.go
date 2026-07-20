package auth

import (
	"errors"
	"net"
	"strings"
	"unicode"

	"backend-go/internal/companies"
	"backend-go/internal/shared/security"
	"backend-go/internal/users"

	"golang.org/x/crypto/bcrypt"
)

func (s *Service) RegisterCompany(input RegisterCompanyRequest) (*RegisterCompanyResponse, error) {
	if err := s.validateRegisterCompanyInput(input); err != nil {
		return nil, err
	}

	if err := s.validateCompanyName(input.CompanyName); err != nil {
		return nil, err
	}

	if err := s.validateResponsibleName(input.ResponsibleName); err != nil {
		return nil, err
	}

	if err := s.validateCorporateEmail(input.CorporateEmail); err != nil {
		return nil, err
	}

	if err := s.validateCorporateEmail(input.ResponsibleEmail); err != nil {
		return nil, err
	}

	if err := s.validatePassword(input.Password); err != nil {
		return nil, err
	}

	if err := s.validateCNPJFormat(input.CNPJ); err != nil {
		return nil, err
	}

	if err := s.validatePhone(input.CompanyPhone); err != nil {
		return nil, err
	}

	if err := s.validatePhone(input.ResponsiblePhone); err != nil {
		return nil, err
	}

	if err := s.validateCompanyDoesNotExist(input.CNPJ); err != nil {
		return nil, err
	}

	if err := s.validateUserDoesNotExist(input.ResponsibleEmail); err != nil {
		return nil, err
	}

	if err := s.validateCompanyEmailDoesNotExist(input.CorporateEmail); err != nil {
		return nil, err
	}

	if err := s.Api.VerifyCNPJ(input.CNPJ); err != nil {
		return nil, err
	}

	hashedPw, err := s.hashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	company := s.buildCompany(input)

	user := s.buildCompanyAdminUser(input, hashedPw)

	result, err := s.Repository.CreateCompanyAndUser(company, user)
	if err != nil {
		return nil, err
	}

	result.Token, err = s.generateJWT(result.UserID, result.CompanyID, users.RoleCompanyAdmin, result.CompanyStatus)
	if err != nil {
		return nil, errors.New("não foi possível gerar o JWT")
	}

	return result, nil
}

func (s *Service) generateJWT(userID, companyID, role, userStatus string) (string, error) {
	token, err := security.GenerateJWT(
		s.JWTSecret,
		userID,
		companyID,
		role,
		userStatus,
	)

	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *Service) validateRegisterCompanyInput(input RegisterCompanyRequest) error {
	if !input.AcceptedTerms {
		return errors.New("é necessário aceitar os termos de uso")
	}

	if !input.AcceptedPrivacyPolicy {
		return errors.New("é necessário aceitar a política de privacidade")
	}

	return nil
}

func (s *Service) validateCorporateEmail(email string) error {
	domain, err := getEmailDomain(email)
	if err != nil {
		return err
	}

	if domainNotAllowed[domain] {
		return errors.New("use um e-mail corporativo com domínio próprio da empresa")
	}

	mxRecords, err := net.LookupMX(domain)
	if err != nil || len(mxRecords) == 0 {
		return errors.New("o domínio do e-mail não possui servidor de e-mail válido")
	}

	return nil
}

func (s *Service) validateCompanyName(name string) error {
	name = strings.TrimSpace(name)

	if name == "" {
		return errors.New("o nome da empresa não pode ser vazio")
	}

	if len(name) < 3 {
		return errors.New("o nome da empresa deve ter no mínimo 3 caracteres")
	}

	if len(name) > 180 {
		return errors.New("o nome da empresa deve ter no máximo 180 caracteres")
	}

	if isOnlyNumbers(name) {
		return errors.New("o nome da empresa não pode conter apenas números")
	}

	if !hasLetter(name) {
		return errors.New("o nome da empresa deve conter pelo menos uma letra")
	}

	return nil
}

func (s *Service) validateResponsibleName(name string) error {
	name = strings.TrimSpace(name)

	if name == "" {
		return errors.New("o nome do responsável não pode ser vazio")
	}

	if len(name) < 3 {
		return errors.New("o nome do responsável deve ter no mínimo 3 caracteres")
	}

	if len(name) > 150 {
		return errors.New("o nome do responsável deve ter no máximo 150 caracteres")
	}

	if !hasLetter(name) {
		return errors.New("o nome do responsável deve conter pelo menos uma letra")
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

func (s *Service) validateCNPJFormat(cnpj string) error {
	cnpj = cleanOnlyNumbers(cnpj)

	if len(cnpj) != 14 {
		return errors.New("o CNPJ deve conter 14 dígitos")
	}

	for _, char := range cnpj {
		if !unicode.IsDigit(char) {
			return errors.New("o CNPJ deve conter apenas números")
		}
	}

	if isRepeatedDigits(cnpj) {
		return errors.New("CNPJ inválido")
	}

	return nil
}

func (s *Service) validatePhone(phone string) error {
	phone = strings.TrimSpace(phone)

	if phone == "" {
		return nil
	}

	phone = cleanOnlyNumbers(phone)

	if len(phone) < 10 || len(phone) > 15 {
		return errors.New("telefone inválido")
	}

	for _, char := range phone {
		if !unicode.IsDigit(char) {
			return errors.New("telefone deve conter apenas números")
		}
	}

	return nil
}

func (s *Service) validateUserDoesNotExist(email string) error {
	email = strings.ToLower(strings.TrimSpace(email))

	emailExists, err := s.Repository.EmailExists(email)
	if err != nil {
		return err
	}

	if emailExists {
		return errors.New("email já cadastrado")
	}

	return nil
}

func (s *Service) validateCompanyDoesNotExist(cnpj string) error {
	cnpj = cleanOnlyNumbers(cnpj)

	cnpjExists, err := s.Repository.CNPJExists(cnpj)
	if err != nil {
		return err
	}

	if cnpjExists {
		return errors.New("CNPJ já cadastrado")
	}

	return nil
}

func (s *Service) validateCompanyEmailDoesNotExist(email string) error {
	email = strings.ToLower(strings.TrimSpace(email))

	emailExists, err := s.Repository.CompanyEmailExists(email)
	if err != nil {
		return err
	}

	if emailExists {
		return errors.New("email da corporação já cadastrado")
	}

	return nil
}

func (s *Service) hashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(hashedPassword), nil
}

func (s *Service) buildCompany(input RegisterCompanyRequest) companies.Company {
	return companies.Company{
		Name:           strings.TrimSpace(input.CompanyName),
		CNPJ:           cleanOnlyNumbers(input.CNPJ),
		CorporateEmail: strings.ToLower(strings.TrimSpace(input.CorporateEmail)),
		Phone:          cleanOnlyNumbers(input.CompanyPhone),
		Status:         companies.CompanyStatusPendingPlanSelection,
	}
}

func (s *Service) buildCompanyAdminUser(input RegisterCompanyRequest, hashedPassword string) users.User {
	return users.User{
		Name:                  strings.TrimSpace(input.ResponsibleName),
		Email:                 strings.ToLower(strings.TrimSpace(input.ResponsibleEmail)),
		PasswordHash:          hashedPassword,
		Role:                  users.RoleCompanyAdmin,
		Status:                users.UserStatusPendingPlanSelection,
		Phone:                 cleanOnlyNumbers(input.ResponsiblePhone),
		AcceptedTerms:         input.AcceptedTerms,
		AcceptedPrivacyPolicy: input.AcceptedPrivacyPolicy,
	}
}

func cleanOnlyNumbers(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, ".", "")
	value = strings.ReplaceAll(value, "/", "")
	value = strings.ReplaceAll(value, "-", "")
	value = strings.ReplaceAll(value, "(", "")
	value = strings.ReplaceAll(value, ")", "")
	value = strings.ReplaceAll(value, " ", "")

	return value
}

func isOnlyNumbers(value string) bool {
	value = strings.TrimSpace(value)

	if value == "" {
		return false
	}

	for _, char := range value {
		if char == ' ' {
			continue
		}

		if !unicode.IsNumber(char) {
			return false
		}
	}

	return true
}

func hasLetter(value string) bool {
	for _, char := range value {
		if unicode.IsLetter(char) {
			return true
		}
	}

	return false
}

func isRepeatedDigits(value string) bool {
	if value == "" {
		return false
	}

	first := value[0]

	for i := 1; i < len(value); i++ {
		if value[i] != first {
			return false
		}
	}

	return true
}

func getEmailDomain(email string) (string, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	parts := strings.Split(email, "@")

	if len(parts) != 2 {
		return "", errors.New("e-mail inválido")
	}

	if parts[0] == "" || parts[1] == "" {
		return "", errors.New("e-mail inválido")
	}

	return parts[1], nil
}

var domainNotAllowed = map[string]bool{
	"gmail.com":      true,
	"hotmail.com":    true,
	"outlook.com":    true,
	"yahoo.com":      true,
	"icloud.com":     true,
	"live.com":       true,
	"msn.com":        true,
	"bol.com.br":     true,
	"uol.com.br":     true,
	"terra.com.br":   true,
	"proton.me":      true,
	"protonmail.com": true,
	"mail.com":       true,
	"aol.com":        true,
	"gmx.com":        true,

	// Temporários / descartáveis comuns
	"10minutemail.com":  true,
	"tempmail.com":      true,
	"guerrillamail.com": true,
	"mailinator.com":    true,
	"yopmail.com":       true,
}
