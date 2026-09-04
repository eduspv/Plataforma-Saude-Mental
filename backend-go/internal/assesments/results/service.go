package results

import (
	"backend-go/internal/assesments/questions"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/google/uuid"
)

type Service struct {
	Repository    *Repository
	QuestionsRepo *questions.Repository
}

func NewService(questionsRepo *questions.Repository, repository *Repository) *Service {
	return &Service{
		QuestionsRepo: questionsRepo,
		Repository:    repository,
	}
}

func (s *Service) CreateSubmitAnswers(ctx context.Context, input SubmitRequest, userID, companyID uuid.UUID) (SubmitResultResponse, error) {
	var empty SubmitResultResponse

	activeVersion, err := s.QuestionsRepo.GetActiveFormVersion(ctx)
	if err != nil {
		return empty, err
	}
	if input.FormVersion != activeVersion {
		return empty, errors.New("a versão do formulário não é a ativa, recarregue")
	}

	formQuestions, err := s.QuestionsRepo.GetActiveQuestions(ctx, activeVersion)
	if err != nil {
		return empty, err
	}

	answersByID, err := buildAnswersMap(input.Answers)
	if err != nil {
		return empty, err
	}

	if err := s.ValidateAnswers(answersByID, formQuestions); err != nil {
		return empty, err
	}

	exists, err := s.Repository.HasTestToday(ctx, userID)
	if err != nil {
		return empty, err
	}
	if exists {
		return empty, ErrAlreadyTestedToday
	}

	score, err := s.calculateScore(formQuestions, answersByID)
	if err != nil {
		return empty, err
	}

	classification := classify(score)
	recommendation := recommendationFor(classification)

	test := &DiagnosticTest{
		UserID:         userID,
		CompanyID:      companyID,
		FormVersion:    activeVersion,
		TotalScore:     score.TotalScore,
		Classification: classification,
		IsCritical:     score.CriticalTriggered,
		Recommendation: recommendation,
		Answers:        score.Answers,
	}

	if err := s.Repository.RegisterFormResults(ctx, test); err != nil {
		return empty, err
	}

	return SubmitResultResponse{
		Classification: classification,
		Recommendation: recommendation,
		Disclaimer:     triagemDisclaimer,
	}, nil
}

func buildAnswersMap(answers []SubmitAnswer) (map[uuid.UUID]string, error) {
	answersByID := make(map[uuid.UUID]string)
	for _, a := range answers {
		if _, dup := answersByID[a.QuestionID]; dup {
			return nil, fmt.Errorf("pergunta respondida duas vezes: %s", a.QuestionID)
		}
		answersByID[a.QuestionID] = a.Value
	}
	return answersByID, nil
}

func (s *Service) ValidateAnswers(answersByID map[uuid.UUID]string, formQuestions []*questions.Question) error {
	questionsByID := make(map[uuid.UUID]*questions.Question)
	for _, q := range formQuestions {
		questionsByID[q.ID] = q
	}
	// 1. Falta alguma? percorre as perguntas, exige resposta pra cada uma
	for _, q := range formQuestions {
		if _, ok := answersByID[q.ID]; !ok {
			return fmt.Errorf("pergunta não respondida: %s", q.ID)
		}
	}

	// 2. Sobra alguma? toda resposta tem que apontar pra uma pergunta ativa
	for id := range answersByID {
		if _, ok := questionsByID[id]; !ok {
			return fmt.Errorf("resposta para pergunta inexistente ou inativa: %s", id)
		}
	}

	// 3. O value é válido para o TYPE daquela pergunta?
	for _, q := range formQuestions {
		value := answersByID[q.ID] // seguro: passo 1 garantiu que existe

		switch q.Type {
		case "scale_1_5":
			n, err := strconv.Atoi(value)
			if err != nil || n < 1 || n > 5 {
				return fmt.Errorf("escala 1–5 inválida na pergunta %s: %q", q.ID, value)
			}

		/*case "yes_no":
			if value != "yes" && value != "no" {
				return fmt.Errorf("resposta yes/no inválida na pergunta %s: %q", q.ID, value)
			}

		case "multiple_choice":
			idx, err := strconv.Atoi(value)
			if err != nil || idx < 0 || idx >= s.optionCount(q) {
				return fmt.Errorf("opção inválida na pergunta %s: %q", q.ID, value)
			}*/

		default:
			return fmt.Errorf("tipo de pergunta desconhecido (%s) na pergunta %s", q.Type, q.ID)
		}
	}

	return nil

}

func (s *Service) calculateScore(formQuestions []*questions.Question, answersByID map[uuid.UUID]string) (ScoreResult, error) {
	var result ScoreResult

	for _, q := range formQuestions {
		value := answersByID[q.ID]

		raw, err := strconv.Atoi(value)
		if err != nil {
			return result, fmt.Errorf("valor não numérico na pergunta %s: %q", q.ID, value)
		}

		pontos := raw * q.Weight
		result.TotalScore += pontos
		result.MaxScore += 5 * q.Weight

		if q.IsCritical && raw >= 4 {
			result.CriticalTriggered = true
		}

		// score individual de cada resposta (pra gravar em diagnostic_answers)
		result.Answers = append(result.Answers, DiagnosticAnswer{
			QuestionID:  q.ID,
			AnswerValue: value,
			Score:       pontos,
		})
	}

	return result, nil
}

func (s *Service) optionCount(q *questions.Question) int {
	if len(q.Options) == 0 || string(q.Options) == "null" {
		return 0
	}
	var opts []struct {
		Label string `json:"label"`
	}
	if err := json.Unmarshal(q.Options, &opts); err != nil {
		return 0
	}
	return len(opts)
}

func classify(score ScoreResult) string {
	if score.CriticalTriggered {
		return "risco_critico"
	}
	if score.MaxScore == 0 {
		return "apto"
	}
	pct := float64(score.TotalScore) / float64(score.MaxScore) * 100

	switch {
	case pct <= 15:
		return "apto"
	case pct <= 30:
		return "apto_com_acompanhamento"
	case pct <= 50:
		return "necessita_avaliacao_psicologica"
	case pct <= 65:
		return "necessita_avaliacao_psiquiatrica"
	case pct <= 80:
		return "necessita_avaliacao_psicologica_psiquiatrica"
	default:
		return "risco_elevado"
	}
}

func recommendationFor(classification string) string {
	switch classification {
	case "apto":
		return "Nenhum sinal de atenção no momento. Continue se cuidando."
	case "apto_com_acompanhamento":
		return "Recomenda-se acompanhamento psicológico preventivo."
	case "necessita_avaliacao_psicologica":
		return "Recomenda-se buscar avaliação com um profissional de psicologia."
	case "necessita_avaliacao_psiquiatrica":
		return "Recomenda-se buscar avaliação com um profissional de psiquiatria."
	case "necessita_avaliacao_psicologica_psiquiatrica":
		return "Recomenda-se avaliação psicológica e psiquiátrica."
	case "risco_elevado":
		return "Risco elevado. Recomenda-se procurar um profissional habilitado o quanto antes."
	case "risco_critico":
		return "Risco crítico. Procure ajuda profissional imediatamente ou contate o CVV (188)."
	default:
		return "Recomenda-se buscar orientação profissional."
	}
}

const triagemDisclaimer = "Este resultado é uma triagem inicial e não substitui avaliação médica, psicológica ou psiquiátrica profissional."

func (s *Service) GetUserDiagnosticHistory(ctx context.Context, userID uuid.UUID) (*UserHistoryResponse, error) {
	userHistory, err := s.Repository.GetAllUserDiagnostic(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &UserHistoryResponse{
		Tests: userHistory,
	}, nil
}
