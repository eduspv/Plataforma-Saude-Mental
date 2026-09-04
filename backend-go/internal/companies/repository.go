package companies

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) GetCompanyByID(id string) (*Company, error) {
	query := `
		SELECT id, name, cnpj, corporate_email, phone, status, asaas_customer_id, created_at, updated_at
		FROM companies
		WHERE id = $1
	`
	var c Company
	err := r.DB.QueryRow(context.Background(), query, id).Scan(
		&c.ID,
		&c.Name,
		&c.CNPJ,
		&c.CorporateEmail,
		&c.Phone,
		&c.Status,
		&c.AsaasCustomerID,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errors.New("empresa não encontrada")
		}
		return nil, err
	}
	return &c, nil
}
func (r *Repository) GettingCompanyStatusFromID(companyID string) (string, error) {
	var status string
	query := `
		SELECT status FROM companies WHERE id = $1
	`
	err := r.DB.QueryRow(context.Background(), query, companyID).Scan(&status)
	if err != nil {
		return "", err
	}
	return status, nil
}

func (r *Repository) UpdateAsaasCustomerID(companyID, customerID string) error {
	query := `UPDATE companies SET asaas_customer_id = $1, updated_at = NOW() WHERE id = $2`
	tag, err := r.DB.Exec(context.Background(), query, customerID, companyID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return errors.New("empresa não encontrada ao salvar asaas_customer_id")
	}
	return nil
}

func (r *Repository) GetCompanyProfileData(ctx context.Context, companyID string) (*CompanyProfileResponse, error) {
	profileData := &CompanyProfileResponse{}
	query := `
		SELECT name, corporate_email, status, cnpj, phone FROM companies WHERE id = $1
	`
	err := r.DB.QueryRow(ctx, query, companyID).Scan(&profileData.Name, &profileData.Email, &profileData.Status, &profileData.Cnpj, &profileData.Telefone)
	if err != nil {
		return nil, err
	}
	return profileData, nil
}
