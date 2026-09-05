package plans

import "time"

type Plan struct {
	ID               string
	Name             string
	Description      string
	PriceCents       int
	Currency         string
	DueDateLimitDays int32
	BillingCycle     string
	MaxEmployees     int
	IsActive         bool
	CreatedAt        *time.Time
	UpdatedAt        *time.Time
	Features         []string `json:"features"`
}

var defaultFeatures = []string{
	"Triagem de saúde mental para todos os colaboradores",
	"Painel de indicadores agregados para o RH",
	"Dados sensíveis protegidos conforme a LGPD",
	"Acompanhamento alinhado à NR-1",
	"Suporte por e-mail",
}
