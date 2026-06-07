package users

import "time"

const (
	RoleSystemAdmin  = "SYSTEM_ADMIN"
	RoleCompanyAdmin = "COMPANY_ADMIN"
	RoleEmployee     = "EMPLOYEE"

	UserStatusPendingPlanSelection = "pending_plan_selection"
	UserStatusPendingPayment       = "pending_payment"
	UserStatusActive               = "active"
	UserStatusBlocked              = "blocked"
	UserStatusInactive             = "inactive"
)

type User struct {
	ID                      string
	CompanyID               *string
	Name                    string
	Email                   string
	PasswordHash            string
	Role                    string
	Status                  string
	Phone                   string
	AcceptedTerms           bool
	AcceptedTermsAt         *time.Time
	AcceptedPrivacyPolicy   bool
	AcceptedPrivacyPolicyAt *time.Time
	CreatedAt               time.Time
	UpdatedAt               time.Time
}
