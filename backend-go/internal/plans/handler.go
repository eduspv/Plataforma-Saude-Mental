package plans

import "github.com/gin-gonic/gin"

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (h *Handler) GetAllPLans(c *gin.Context) {
	plans, err := h.Service.GettingAllPLans(c.Request.Context())
	if err != nil {
		c.JSON(500, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	response := make([]AllPlansResponse, 0, len(plans))
	for _, p := range plans {
		response = append(response, AllPlansResponse{
			ID:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			PriceCents:   p.PriceCents,
			Currency:     p.Currency,
			BillingCycle: p.BillingCycle,
			MaxEmployees: p.MaxEmployees,
			Features:     defaultFeatures,
		})
	}

	c.JSON(200, gin.H{
		"success": true,
		"message": "todos os planos ativos retornados",
		"plans":   response,
	})
}
