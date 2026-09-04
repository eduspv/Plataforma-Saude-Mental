package users

import "time"

type NewEmployeeRequest struct {
	Name                  string `json:"name"`
	Email                 string `json:"email"`
	Cpf                   string `json:"cpf"`
	Password              string `json:"password"`
	AcceptedTerms         bool   `json:"accepted_terms"`
	AcceptedPrivacyPolicy bool   `json:"accepted_privacy_policy"`
}

type AuthContext struct {
	UserID    string
	CompanyID string
	Role      string
	Status    string
}

type UserInput struct {
	Req  NewEmployeeRequest
	Auth AuthContext
}

type NewEmployeeResponse struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	//Password string `json:"password"` TODO: pos mvp enviar a senha em momentos importantes por enquanto vamos gravar no front e deixar essa senha lá
}

type EmployeeListItem struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
type ListOfEmployeeResponse struct {
	AllCompanyEmployees []EmployeeListItem `json:"all_company_employee"`
}

type ProfileDataResponse struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}
