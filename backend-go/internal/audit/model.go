package audit

// Event descreve uma ação a ser auditada.
// Espelha as colunas da tabela audit_logs (migration 000015).
type Event struct {
	ActorUserID string // quem fez — user_id do token
	CompanyID   string // de qual empresa partiu — company_id do token
	Action      string // o quê — ex: "employee.deactivated"
	EntityType  string // sobre qual tipo de coisa — ex: "user"
	EntityID    string // id do alvo (pode ser vazio se a ação não tem alvo único)
}
