package dashboard

import "github.com/gin-gonic/gin"

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (h *Handler) DashboardData(c *gin.Context) {
	//var input AuthContext
	//:= h.Service.GettingDAshboardData(input)

	c.JSON(501, gin.H{
		"success": false,
		"message": "Not Implemented",
	})
}
