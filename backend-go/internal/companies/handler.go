package companies

import (
	"log"
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
func (h *Handler) GetCompanyPlanData(c *gin.Context) {
	companyID := c.GetString("company_id")
	CompanyPlanDashboardData, err := h.Service.GetCompanyPlanDashboardData(c.Request.Context(), companyID)
	if err != nil {
		log.Print("erro:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "falhou em alguma busca",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    CompanyPlanDashboardData,
	})

}

func (h *Handler) GetCompanyProfileData(c *gin.Context) {
	companyID := c.GetString("company_id")
	log.Print("company_id: ", companyID)
	ProfileData, err := h.Service.GetCompanyProfileData(c.Request.Context(), companyID)

	if err != nil {
		log.Print("erro:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "falhou em alguma busca",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    ProfileData,
	})
}

func (h *Handler) CompanyPaymentData(c *gin.Context) {
	companyID := c.GetString("company_id")
	data, err := h.Service.CompanyPaymentHistory(c.Request.Context(), companyID)
	if err != nil {
		log.Print("erro:", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "falhou em alguma busca",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
