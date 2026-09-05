package auth

import "github.com/gin-gonic/gin"

type Handler struct {
	Service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		Service: service,
	}
}

func (h *Handler) RegisterCompany(c *gin.Context) {
	var input RegisterCompanyRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"message": "Dados inválidos",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.Service.RegisterCompany(input)
	if err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(201, gin.H{
		"success": true,
		"message": "Cadastro iniciado com sucesso",
		"data":    result,
	})
}

func (h *Handler) Logout(c *gin.Context) {
	return
}

func (h *Handler) Login(c *gin.Context) {
	var input LoginRequest

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"message": "Dados inválidos",
			"error":   err.Error(),
		})
		return
	}

	result, err := h.Service.Login(input)
	if err != nil {
		c.JSON(400, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	c.JSON(201, gin.H{
		"success": true,
		"message": "Cadastro iniciado com sucesso",
		"data":    result,
	})
}
