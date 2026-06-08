package checkout

import "github.com/gin-gonic/gin"

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (h *Handler) RegisterPlan(c *gin.Context) {

}
