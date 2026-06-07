package auth

import (
	"context"

	"backend-go/internal/companies"
	"backend-go/internal/users"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		DB: db,
	}
}
func (r *Repository) CompanyEmailExists(email string) (bool, error) {
	var exists bool

	query := `
		SELECT EXISTS (
			SELECT 1 FROM companies WHERE corporate_email = $1
		)
	`

	err := r.DB.QueryRow(context.Background(), query, email).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *Repository) EmailExists(email string) (bool, error) {
	var exists bool

	query := `
		SELECT EXISTS (
			SELECT 1 FROM users WHERE email = $1
		)
	`

	err := r.DB.QueryRow(context.Background(), query, email).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *Repository) CNPJExists(cnpj string) (bool, error) {
	var exists bool

	query := `
		SELECT EXISTS (
			SELECT 1 FROM companies WHERE cnpj = $1
		)
	`

	err := r.DB.QueryRow(context.Background(), query, cnpj).Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (r *Repository) CreateCompanyAndUser(company companies.Company, user users.User) (*RegisterCompanyResponse, error) {
	tx, err := r.DB.Begin(context.Background())
	if err != nil {
		return nil, err
	}

	defer tx.Rollback(context.Background())

	var companyID string

	createCompanyQuery := `
		INSERT INTO companies (
			name,
			cnpj,
			corporate_email,
			phone,
			status,
			created_at,
			updated_at
		)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		RETURNING id
	`

	err = tx.QueryRow(
		context.Background(),
		createCompanyQuery,
		company.Name,
		company.CNPJ,
		company.CorporateEmail,
		company.Phone,
		company.Status,
	).Scan(&companyID)

	if err != nil {
		return nil, err
	}

	var userID string

	createUserQuery := `
		INSERT INTO users (
			company_id,
			name,
			email,
			password_hash,
			role,
			status,
			phone,
			accepted_terms,
			accepted_terms_at,
			accepted_privacy_policy,
			accepted_privacy_policy_at,
			created_at,
			updated_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6, $7,
			$8,
			CASE WHEN $8 = true THEN NOW() ELSE NULL END,
			$9,
			CASE WHEN $9 = true THEN NOW() ELSE NULL END,
			NOW(),
			NOW()
		)
		RETURNING id
	`

	err = tx.QueryRow(
		context.Background(),
		createUserQuery,
		companyID,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.Status,
		user.Phone,
		user.AcceptedTerms,
		user.AcceptedPrivacyPolicy,
	).Scan(&userID)

	if err != nil {
		return nil, err
	}

	err = tx.Commit(context.Background())
	if err != nil {
		return nil, err
	}

	return &RegisterCompanyResponse{
		CompanyID:     companyID,
		UserID:        userID,
		CompanyStatus: company.Status,
		UserStatus:    user.Status,
		NextStep:      "select_plan",
	}, nil
}
