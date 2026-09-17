package middleware

import (
	"log"
	"net/http"
	"strings"

	"backend-go/internal/shared/logger"
	"backend-go/internal/shared/security"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		logger.Debug("[AUTH_MIDDLEWARE] Iniciando validação do token")

		authHeader := c.GetHeader("Authorization")

		logger.Debug("[AUTH_MIDDLEWARE] Authorization header existe? %t", authHeader != "")

		if authHeader == "" {
			log.Println("[AUTH_MIDDLEWARE] Token não informado")

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token não informado",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")

		logger.Debug("[AUTH_MIDDLEWARE] Quantidade de partes no Authorization: %d", len(parts))

		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Println("[AUTH_MIDDLEWARE] Formato do token inválido")

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "formato do token inválido",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		logger.Debug("[AUTH_MIDDLEWARE] Tamanho do token: %d", len(tokenString))

		claims, err := security.ValidateJWT(tokenString, jwtSecret)
		if err != nil {
			log.Println("[AUTH_MIDDLEWARE] Erro ao validar token:", err.Error())

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token inválido ou expirado",
				"error":   err.Error(),
			})
			c.Abort()
			return
		}

		logger.Debug("[AUTH_MIDDLEWARE] Token validado com sucesso. user_id=%s company_id=%s role=%s status=%s", claims.UserID, claims.CompanyID, claims.Role, claims.Status)

		c.Set("user_id", claims.UserID)
		c.Set("company_id", claims.CompanyID)
		c.Set("role", claims.Role)
		c.Set("status", claims.Status)

		c.Next()
	}
}
