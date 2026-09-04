package dashboard

// dashboard/dto.go

type CompanyDashboardResponse struct {
	TotalEmployees  int                   `json:"total_employees"`
	TotalTests      int                   `json:"total_tests"`
	EmployeesTested int                   `json:"employees_tested"`
	AtRiskCount     int                   `json:"at_risk_count"` // risco_elevado + risco_critico
	Distribution    []ClassificationCount `json:"distribution"`
}

type ClassificationCount struct {
	Classification string  `json:"classification"`
	Count          int     `json:"count"`
	Percentage     float64 `json:"percentage"`
}
