package users

import "github.com/gin-gonic/gin"

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
