package users

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	Db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		Db: db,
	}
}

func (r *Repository) EmailExists(email string) (bool, error) {
	var exists bool

	email = strings.ToLower(strings.TrimSpace(email))
	query := `
	SELECT EXISTS(
		SELECT 1 FROM users WHERE email = $1
		)
	`
	err := r.Db.QueryRow(context.Background(), query, email).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (r *Repository) CountUsersByCompany(companyID string) (int, error) {
	var amount int

	query := `
		SELECT COUNT(*)
		FROM users
		WHERE company_id = $1
	`

	err := r.Db.QueryRow(
		context.Background(),
		query,
		companyID,
	).Scan(&amount)

	if err != nil {
		return 0, err
	}

	return amount, nil
}

func (r *Repository) CreateNewUser(user *User) error {
	const query = `
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
			accepted_privacy_policy_at
		)
		VALUES (
			$1, $2, $3, $4, $5, $6,
			$7, $8, $9, $10, $11
		)
		RETURNING id, created_at, updated_at
	`

	err := r.Db.QueryRow(
		context.Background(),
		query,
		user.CompanyID,
		user.Name,
		user.Email,
		user.PasswordHash,
		user.Role,
		user.Status,
		user.Phone,
		user.AcceptedTerms,
		user.AcceptedTermsAt,
		user.AcceptedPrivacyPolicy,
		user.AcceptedPrivacyPolicyAt,
	).Scan(
		&user.ID,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("erro ao criar usuário: %w", err)
	}

	return nil
}
