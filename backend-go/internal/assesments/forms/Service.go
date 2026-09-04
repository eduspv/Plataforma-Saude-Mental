package forms

import (
	"backend-go/internal/assesments/questions"
	"context"
	"encoding/json"
	"errors"
	"fmt"
)

type Service struct {
	QuestionsRepo *questions.Repository
}

func NewService(questionsRepo *questions.Repository) *Service {
	return &Service{
		QuestionsRepo: questionsRepo,
	}
}

// Busca crua — devolve ENTIDADE (com weight/is_critical). O submit reusa esta.
func (s *Service) GetActiveQuestions(ctx context.Context) ([]*questions.Question, error) {
	version, err := s.QuestionsRepo.GetActiveFormVersion(ctx)
	if err != nil {
		return nil, err
	}
	if version == 0 {
		return nil, errors.New("não há formulário ativo")
	}
	return s.QuestionsRepo.GetActiveQuestions(ctx, version)
}

// Apresentação — pega a busca crua e monta o DTO. Só o GET /form usa esta.
func (s *Service) GetForm(ctx context.Context) (ActiveFormResponse, error) {
	qs, err := s.GetActiveQuestions(ctx)
	if err != nil {
		return ActiveFormResponse{}, err
	}
	return s.BuildActiveFormResponse(qs)
}

func (s *Service) BuildActiveFormResponse(qs []*questions.Question) (ActiveFormResponse, error) {
	resp := ActiveFormResponse{Steps: []StepDTO{}}
	if len(qs) == 0 {
		return resp, nil
	}
	resp.FormVersion = qs[0].FormVersion // todas são da mesma versão (o repo filtrou por ela)

	stepIndex := make(map[int]int) // nº do step -> posição em resp.Steps

	for _, q := range qs {
		opts, err := s.buildOptions(q)
		if err != nil {
			return resp, fmt.Errorf("montar opções da pergunta %s: %w", q.ID, err)
		}

		qdto := QuestionDTO{
			ID:      q.ID,
			Type:    q.Type,
			Text:    q.QuestionText,
			Order:   q.DisplayOrder,
			Options: opts,
		}

		idx, ok := stepIndex[q.Step]
		if !ok {
			resp.Steps = append(resp.Steps, StepDTO{Step: q.Step, Questions: []QuestionDTO{}})
			idx = len(resp.Steps) - 1
			stepIndex[q.Step] = idx
		}
		resp.Steps[idx].Questions = append(resp.Steps[idx].Questions, qdto)
	}

	return resp, nil
}

func (s *Service) buildOptions(q *questions.Question) ([]OptionDTO, error) {
	if len(q.Options) == 0 || string(q.Options) == "null" {
		return nil, nil // escala e sim/não não têm opções → omitempty corta do JSON
	}

	// struct local que lê SÓ o label — o "score" do banco é ignorado de propósito.
	var raw []struct {
		Label string `json:"label"`
	}
	if err := json.Unmarshal(q.Options, &raw); err != nil {
		return nil, err
	}

	out := make([]OptionDTO, len(raw))
	for i, r := range raw {
		out[i] = OptionDTO{ID: i, Label: r.Label}
	}
	return out, nil
}
