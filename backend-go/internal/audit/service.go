package audit

import (
	"context"
	"log"
)

type Service struct {
	Repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{Repo: repo}
}

// Log registra um evento de auditoria em modo best-effort.
//
// IMPORTANTE: nunca retorna erro. Se a gravação do log falhar, a operação
// principal (que já aconteceu) NÃO deve ser afetada. Falha de auditoria
// vira um log de aplicação e a vida segue. Auditar é secundário à ação real.
func (s *Service) Log(ctx context.Context, e Event) {
	if err := s.Repo.Insert(ctx, e); err != nil {
		log.Printf("[AUDIT] falha ao gravar evento action=%q entity=%s/%s: %v",
			e.Action, e.EntityType, e.EntityID, err)
	}
}
