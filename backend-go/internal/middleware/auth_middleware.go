package middleware

import (
	"net/http"
	"strings"

	"backend-go/internal/shared/security"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token não informado",
			})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "formato do token inválido",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		claims, err := security.ValidateJWT(tokenString, jwtSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token inválido ou expirado",
			})
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("company_id", claims.CompanyID)
		c.Set("role", claims.Role)
		c.Set("status", claims.Status)

		c.Next()
	}
}
