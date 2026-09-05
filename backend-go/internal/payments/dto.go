package payments

import (
	"time"
)

type PaymentRow struct {
	ID            string
	AmountCents   int64
	Currency      string
	PaymentMethod string
	Status        string
	PaidAt        time.Time
}

// PaymentsSummary agrega os dados dos cards de resumo.
type PaymentsSummary struct {
	TotalPaidCents int64
	Currency       string
}
