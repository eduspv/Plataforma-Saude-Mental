package auth

type RegisterCompanyRequest struct {
	CompanyName    string `json:"company_name" binding:"required"`
	CNPJ           string `json:"cnpj" binding:"required"`
	CorporateEmail string `json:"corporate_email" binding:"required,email"`
	CompanyPhone   string `json:"company_phone"`

	ResponsibleName  string `json:"responsible_name" binding:"required"`
	ResponsibleEmail string `json:"responsible_email" binding:"required,email"`
	ResponsiblePhone string `json:"responsible_phone"`
	Password         string `json:"password" binding:"required,min=6"`

	AcceptedTerms         bool `json:"accepted_terms" binding:"required"`
	AcceptedPrivacyPolicy bool `json:"accepted_privacy_policy" binding:"required"`
}

type RegisterCompanyResponse struct {
	CompanyID     string `json:"company_id"`
	UserID        string `json:"user_id"`
	CompanyStatus string `json:"company_status"`
	UserStatus    string `json:"user_status"`
	NextStep      string `json:"next_step"`
	Token         string `json:"token"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"Password"`
}

type LoginResponse struct {
	CompanyID     string `json:"company_id"`
	UserID        string `json:"user_id"`
	CompanyStatus string `json:"company_status"`
	UserStatus    string `json:"user_status"`
	NextStep      string `json:"next_step"`
	Token         string `json:"token"`
}
