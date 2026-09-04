package results

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (h *Handler) SubmitForm(c *gin.Context) {
	var input SubmitRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "dados inválidos", "error": err.Error()})
		return
	}

	// user_id
	userIDRaw, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "usuário não identificado"})
		return
	}
	userIDStr, ok := userIDRaw.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "erro interno (user_id)"})
		return
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "user_id inválido"})
		return
	}

	// company_id
	companyIDRaw, ok := c.Get("company_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "empresa não identificada"})
		return
	}
	companyIDStr, ok := companyIDRaw.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "erro interno (company_id)"})
		return
	}
	companyID, err := uuid.Parse(companyIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "company_id inválido"})
		return
	}

	result, err := h.Service.CreateSubmitAnswers(c.Request.Context(), input, userID, companyID)
	if err != nil {
		if errors.Is(err, ErrAlreadyTestedToday) {
			c.JSON(http.StatusConflict, gin.H{"success": false, "message": "Você já respondeu o diagnóstico hoje. Volte amanhã."})
			return
		}
		log.Printf("SubmitForm: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "erro ao processar o diagnóstico"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": result})
}

func (h *Handler) UserDiagnosticHistory(c *gin.Context) {
	userIDRaw, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "usuário não identificado",
		})
		return
	}

	userIDStr, ok := userIDRaw.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "erro interno (user_id)",
		})
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "user_id inválido",
		})
		return
	}
	userHistoryResponse, err := h.Service.GetUserDiagnosticHistory(c.Request.Context(), userID)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    userHistoryResponse,
	})
}
