package results

import (
	"errors"

	"github.com/google/uuid"
)

var ErrAlreadyTestedToday = errors.New("já respondeu hoje")
var ErrInvalidAnswers = errors.New("respostas inválidas")

type ScoreResult struct {
	TotalScore        int
	MaxScore          int
	CriticalTriggered bool
	Answers           []DiagnosticAnswer // ← este faltava
}

// O teste a ser gravado em diagnostic_tests
type DiagnosticTest struct {
	UserID         uuid.UUID
	CompanyID      uuid.UUID
	FormVersion    int
	TotalScore     int
	Classification string
	IsCritical     bool
	Recommendation string
	Answers        []DiagnosticAnswer // ← as respostas que vão pra diagnostic_answers
}

// Cada resposta a ser gravada em diagnostic_answers
type DiagnosticAnswer struct {
	QuestionID  uuid.UUID
	AnswerValue string
	Score       int
}
