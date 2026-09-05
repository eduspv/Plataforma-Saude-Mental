package results

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) HasTestToday(ctx context.Context, userID uuid.UUID) (bool, error) {
	var exists bool
	query := `
		SELECT EXISTS (
			SELECT 1 FROM diagnostic_tests
			WHERE user_id = $1
			  AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date
			      = (NOW() AT TIME ZONE 'America/Sao_Paulo')::date
		)`
	if err := r.DB.QueryRow(ctx, query, userID).Scan(&exists); err != nil {
		return false, fmt.Errorf("verificar teste do dia: %w", err)
	}
	return exists, nil
}

func (r *Repository) TotalCompaniesTests(ctx context.Context, companyID string) (int, error) {
	var TotalTests int
	query := `
		SELECT COUNT(*)
		FROM diagnostic_tests
		WHERE company_id = $1
	`
	err := r.DB.QueryRow(ctx, query, companyID).Scan(&TotalTests)
	if err != nil {
		return 0, err
	}
	return TotalTests, nil
}

func (r *Repository) RegisterFormResults(ctx context.Context, test *DiagnosticTest) error {
	tx, err := r.DB.Begin(ctx)
	if err != nil {
		return fmt.Errorf("abrir transação: %w", err)
	}
	defer tx.Rollback(ctx) // se der commit, o rollback vira no-op

	// 1. insere o teste e pega o id gerado
	var testID uuid.UUID
	insertTest := `
		INSERT INTO diagnostic_tests
			(user_id, company_id, form_version, total_score, classification, is_critical, recommendation, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'completed')
		RETURNING id`
	err = tx.QueryRow(ctx, insertTest,
		test.UserID, test.CompanyID, test.FormVersion,
		test.TotalScore, test.Classification, test.IsCritical, test.Recommendation,
	).Scan(&testID)
	if err != nil {
		// índice único (Camada 2): se já tem teste hoje, o banco recusa aqui
		if isUniqueViolation(err) {
			return ErrAlreadyTestedToday
		}
		return fmt.Errorf("inserir teste: %w", err)
	}

	// 2. insere cada resposta com o test_id
	insertAns := `
		INSERT INTO diagnostic_answers
			(diagnostic_test_id, question_id, answer_value, score)
		VALUES ($1, $2, $3, $4)`
	for _, a := range test.Answers {
		if _, err := tx.Exec(ctx, insertAns, testID, a.QuestionID, a.AnswerValue, a.Score); err != nil {
			return fmt.Errorf("inserir resposta %s: %w", a.QuestionID, err)
		}
	}

	// 3. confirma tudo de uma vez
	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	return nil
}

func (r *Repository) CountEmployeesTested(ctx context.Context, companyID string) (int, error) {
	var employeesTested int
	query := `
		SELECT COUNT(DISTINCT user_id)
		FROM diagnostic_tests
		WHERE company_id = $1
	`
	err := r.DB.QueryRow(ctx, query, companyID).Scan(&employeesTested)
	if err != nil {
		return 0, fmt.Errorf("contar colaboradores testados: %w", err)
	}
	return employeesTested, nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505" // unique_violation
	}
	return false
}

func (r *Repository) GetAllUserDiagnostic(ctx context.Context, userID uuid.UUID) ([]HistoryItem, error) {
	query := `
		SELECT id, classification, recommendation, created_at
		FROM diagnostic_tests
		WHERE user_id = $1
		ORDER BY created_at DESC`

	rows, err := r.DB.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("consultar histórico: %w", err)
	}
	defer rows.Close()

	history := []HistoryItem{}
	for rows.Next() {
		var item HistoryItem
		if err := rows.Scan(
			&item.ID,
			&item.Classification,
			&item.Recommendation,
			&item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("ler linha do histórico: %w", err)
		}
		history = append(history, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterar histórico: %w", err)
	}

	return history, nil
}
