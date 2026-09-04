package results

import (
	"time"

	"github.com/google/uuid"
)

type SubmitRequest struct {
	FormVersion int            `json:"form_version" binding:"required"`
	Answers     []SubmitAnswer `json:"answers" binding:"required,min=1"`
}

type SubmitAnswer struct {
	QuestionID uuid.UUID `json:"question_id" binding:"required"`
	Value      string    `json:"value" binding:"required"`
}

var TypeQuestions = map[string]string{
	"scale":           "scale 1 to 5",
	"choice":          "true or false",
	"multiple_choice": "escolha multipla",
}

type SubmitResultResponse struct {
	Classification string `json:"classification"`
	Recommendation string `json:"recommendation"`
	Disclaimer     string `json:"disclaimer"`
}

// Um teste na lista do histórico
type HistoryItem struct {
	ID             uuid.UUID `json:"id"`
	Classification string    `json:"classification"`
	Recommendation string    `json:"recommendation"`
	CreatedAt      time.Time `json:"created_at"`
}

// O envelope da resposta
type UserHistoryResponse struct {
	Tests []HistoryItem `json:"tests"`
}
