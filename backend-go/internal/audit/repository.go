package audit

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	DB *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{DB: db}
}

// Insert grava um evento de auditoria. Query parametrizada ($1..$5).
// entity_id pode ir vazio; tratamos isso no service antes de chamar.
func (r *Repository) Insert(ctx context.Context, e Event) error {
	query := `
		INSERT INTO audit_logs
			(actor_user_id, company_id, action, entity_type, entity_id)
		VALUES ($1, $2, $3, $4, $5)`

	_, err := r.DB.Exec(ctx, query,
		e.ActorUserID, e.CompanyID, e.Action, e.EntityType, entityIDOrNil(e.EntityID))
	return err
}

// entityIDOrNil converte string vazia em NULL para a coluna entity_id
// (que é a única nullable). UUID não aceita string "" — tem que ser nil.
func entityIDOrNil(id string) interface{} {
	if id == "" {
		return nil
	}
	return id
}
