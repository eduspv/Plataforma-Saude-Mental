package forms

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

func (h *Handler) GetForm(c *gin.Context) {
	resp, err := h.Service.GetForm(c.Request.Context())
	if err != nil {
		log.Printf("GetForm: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "erro ao carregar o formulário",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": resp})
}
