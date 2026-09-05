package questions

import (
	"context"
	"fmt"

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
func (r *Repository) GetActiveQuestions(ctx context.Context, formVersion int) ([]*Question, error) {
	query := `
		SELECT id, form_version, step, question_text, type, options,
		       weight, is_critical, display_order
		FROM diagnostic_questions
		WHERE is_active = true AND form_version = $1
		ORDER BY step, display_order`

	rows, err := r.DB.Query(ctx, query, formVersion)
	if err != nil {
		return nil, fmt.Errorf("consultar perguntas ativas: %w", err)
	}
	defer rows.Close()

	var questions []*Question
	for rows.Next() {
		q := &Question{}
		if err := rows.Scan(
			&q.ID, &q.FormVersion, &q.Step, &q.QuestionText, &q.Type, &q.Options,
			&q.Weight, &q.IsCritical, &q.DisplayOrder,
		); err != nil {
			return nil, fmt.Errorf("ler pergunta: %w", err)
		}
		questions = append(questions, q)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterar perguntas: %w", err)
	}

	return questions, nil
}

func (r *Repository) GetActiveFormVersion(ctx context.Context) (int, error) {
	var formVersion int
	query := `
		SELECT COALESCE(MAX(form_version), 0) FROM diagnostic_questions WHERE is_active = true
	`
	err := r.DB.QueryRow(ctx, query).Scan(&formVersion)
	if err != nil {
		return 0, fmt.Errorf("buscar versão ativa do formulário: %w", err)
	}
	return formVersion, nil
}
