package users

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

func (h *Handler) RegisterNewEmployee(c *gin.Context) {
	var request NewEmployeeRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"message": "Dados inválidos",
			"error":   err.Error(),
		})
		return
	}

	authContext := AuthContext{
		UserID:    c.GetString("user_id"),
		CompanyID: c.GetString("company_id"),
		Role:      c.GetString("role"),
		Status:    c.GetString("status"),
	}

	input := &UserInput{
		Req:  request,
		Auth: authContext,
	}

	result, err := h.Service.RegisterNewEmployee(input)
	if err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(201, gin.H{
		"success": true,
		"message": "Checkout criado com sucesso",
		"data":    result,
	})
}

func (h *Handler) ListOfAllCompanieEmployees(c *gin.Context) {
	companyIDRaw, exists := c.Get("company_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "usuário não identificado",
		})
		return
	}

	companyID, ok := companyIDRaw.(string)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "erro interno (user_id)",
		})
		return
	}
	listOfEmployees, err := h.Service.GetAllCompanieEmployees(c.Request.Context(), companyID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "falhou em alguma busca",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    listOfEmployees,
	})
}

func (h *Handler) GetUserProfileData(c *gin.Context) {
	userID := c.GetString("user_id")
	ProfileData, err := h.Service.GetProfileData(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
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

func (h *Handler) DeactivateEmployee(c *gin.Context) {
	// 1. id do colaborador — vem da URL
	employeeID := c.Param("id")
	// 2. company_id e user_id de quem chama — vêm do TOKEN (nunca do body/URL)
	companyID := c.GetString("company_id")
	// ... (mesmo padrão de sempre)
	actorUserID := c.GetString("user_id") // NOVO: quem está executando

	// 3. chama o service passando os dois ids
	err := h.Service.UpdateEmployeeToInactive(c.Request.Context(), employeeID, companyID, actorUserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": err,
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "o usuario agora esta inativo",
	})
	return
}
