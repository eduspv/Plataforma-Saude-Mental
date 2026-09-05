package middleware

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole bloqueia requests cujo usuário logado não tenha um dos
// cargos informados. Deve ser aplicado APÓS o AuthMiddleware.
func RequireRole(role ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		contextRole, exists := c.Get("role")
		if !exists {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "acesso negado",
			})
			return
		}
		for i := 0; i < len(role); i++ {
			if role[i] == contextRole {
				c.Next()
				return
			}
		}
		log.Printf("[ROLE_MIDDLEWARE] role '%v' não autorizado", contextRole)
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "acesso negado",
		})
	}
}
