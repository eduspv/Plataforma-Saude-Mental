package dashboard

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (h *Handler) DashboardData(c *gin.Context) {
	companyID := c.GetString("company_id")
	companyDashboardResponse, err := h.Service.GettingDashboardData(c.Request.Context(), companyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "falhou em alguma busca",
		})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"message": "sucesso em achar os dados do dashboard",
		"data":    companyDashboardResponse,
	})
}
