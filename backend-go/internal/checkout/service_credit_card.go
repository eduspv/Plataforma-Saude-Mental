package checkout

import (
	"errors"
	"time"
)

func (s *Service) validateCreditCardForBd(ck *CheckoutSession) (*CheckoutSession, error) {
	switch ck.ChargeType {
	case ChargeTypeDetached:
		if err := s.validateCreditCardDetached(ck); err != nil {
			return nil, err
		}

	case ChargeTypeRecurrent:
		if err := s.validateCreditCardRecurrent(ck); err != nil {
			return nil, err
		}

	case ChargeTypeInstallment:
		if err := s.validateCreditCardInstallment(ck); err != nil {
			return nil, err
		}

	default:
		return nil, errors.New("tipo de cobrança inválido para cartão de crédito")
	}

	return ck, nil
}

func (s *Service) validateCreditCardDetached(ck *CheckoutSession) error {
	if ck.EndDate == nil {
		return errors.New("a data de encerramento é obrigatória")
	}

	if err := s.validateEndDateUntilTomorrow(ck.EndDate); err != nil {
		return err
	}

	return nil
}

func (s *Service) validateCreditCardRecurrent(ck *CheckoutSession) error {
	if ck.EndDate == nil {
		return errors.New("a data de encerramento é obrigatória")
	}

	if err := s.validateEndDateUntilTomorrow(ck.EndDate); err != nil {
		return err
	}

	if ck.SubscriptionCycle == nil || *ck.SubscriptionCycle == "" {
		return errors.New("o ciclo da assinatura é obrigatório para cobrança recorrente")
	}

	if !isValidSubscriptionCycle(*ck.SubscriptionCycle) {
		return errors.New("ciclo da assinatura inválido")
	}

	return nil
}

func (s *Service) validateCreditCardInstallment(ck *CheckoutSession) error {
	if ck.EndDate == nil {
		return errors.New("a data de encerramento é obrigatória")
	}

	if err := s.validateEndDateUntilTomorrow(ck.EndDate); err != nil {
		return err
	}

	if ck.MaxInstallmentCount == nil {
		return errors.New("a quantidade máxima de parcelas é obrigatória")
	}

	if *ck.MaxInstallmentCount < 2 {
		return errors.New("a quantidade mínima para parcelamento é de 2 parcelas")
	}

	if *ck.MaxInstallmentCount > 12 {
		return errors.New("a quantidade máxima permitida é de 12 parcelas")
	}

	return nil
}

func (s *Service) validateEndDateUntilTomorrow(endDateInput *time.Time) error {
	now := time.Now()

	today := time.Date(
		now.Year(),
		now.Month(),
		now.Day(),
		0,
		0,
		0,
		0,
		now.Location(),
	)

	limitDate := today.AddDate(0, 0, 1)

	endDate := time.Date(
		endDateInput.Year(),
		endDateInput.Month(),
		endDateInput.Day(),
		0,
		0,
		0,
		0,
		now.Location(),
	)

	if endDate.Before(today) {
		return errors.New("a data de encerramento não pode estar no passado")
	}

	if endDate.After(limitDate) {
		return errors.New("a data de encerramento deve ser de no máximo 1 dia após a data atual")
	}

	return nil
}

func isValidSubscriptionCycle(cycle string) bool {
	switch SubscriptionCycle(cycle) {
	case
		SubscriptionCycleMonthly,
		SubscriptionCycleYearly:
		return true
	default:
		return false
	}
}
