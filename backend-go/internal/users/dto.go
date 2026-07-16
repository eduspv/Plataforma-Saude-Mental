package users

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
