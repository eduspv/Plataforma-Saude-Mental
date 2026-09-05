package questions

import "github.com/google/uuid"

// internal/assessments/questions/model.go
type Question struct {
	ID           uuid.UUID
	FormVersion  int
	Step         int
	QuestionText string
	Type         string
	Options      []byte // JSONB cru; cada option tem label + score
	Weight       int    // sensível — NÃO vai pro JSON
	IsCritical   bool   // sensível — NÃO vai pro JSON
	IsActive     bool
	DisplayOrder int
}
