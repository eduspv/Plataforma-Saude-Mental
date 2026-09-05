package forms

import "github.com/google/uuid"

// forms/dto.go

// Nível 1 — o formulário inteiro
type ActiveFormResponse struct {
	FormVersion int       `json:"form_version"`
	Steps       []StepDTO `json:"steps"`
}

// Nível 2 — cada uma das 5 etapas
type StepDTO struct {
	Step      int           `json:"step"`
	Questions []QuestionDTO `json:"questions"`
}

// Nível 3 — cada pergunta
type QuestionDTO struct {
	ID      uuid.UUID   `json:"id"`
	Type    string      `json:"type"`
	Text    string      `json:"text"`
	Order   int         `json:"order"`
	Options []OptionDTO `json:"options,omitempty"`
}

// Nível 4 — as alternativas (só multiple_choice tem)
type OptionDTO struct {
	ID    int    `json:"id"`
	Label string `json:"label"`
}
