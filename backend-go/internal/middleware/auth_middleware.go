package middleware

import (
	"log"
	"net/http"
	"strings"

	"backend-go/internal/shared/security"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		log.Println("[AUTH_MIDDLEWARE] Iniciando validação do token")
		log.Println("[AUTH_MIDDLEWARE] JWT_SECRET recebido?", jwtSecret != "")

		authHeader := c.GetHeader("Authorization")

		log.Println("[AUTH_MIDDLEWARE] Authorization header existe?", authHeader != "")

		if authHeader == "" {
			log.Println("[AUTH_MIDDLEWARE] Token não informado")

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "token não informado",
			})
			c.Abort()
			return
		}

		log.Println("[AUTH_MIDDLEWARE] Authorization header tamanho:", len(authHeader))

		parts := strings.Split(authHeader, " ")

		log.Println("[AUTH_MIDDLEWARE] Quantidade de partes no Authorization:", len(parts))

		if len(parts) > 0 {
			log.Println("[AUTH_MIDDLEWARE] Prefixo recebido:", parts[0])
		}

		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Println("[AUTH_MIDDLEWARE] Formato do token inválido")
			log.Println("[AUTH_MIDDLEWARE] Header recebido:", authHeader)

			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "formato do token inválido",
			})
			c.Abort()
			return
		}

		tokenString := parts[1]

		log.Println("[AUTH_MIDDLEWARE] Token recebido?", tokenString != "")
		log.Println("[AUTH_MIDDLEWARE] Tamanho do token:", len(tokenString))

		if len(tokenString) > 20 {
			log.Println("[AUTH_MIDDLEWARE] Início do token:", tokenString[:20])
		}

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

		log.Println("[AUTH_MIDDLEWARE] Token validado com sucesso")
		log.Println("[AUTH_MIDDLEWARE] user_id:", claims.UserID)
		log.Println("[AUTH_MIDDLEWARE] company_id:", claims.CompanyID)
		log.Println("[AUTH_MIDDLEWARE] role:", claims.Role)
		log.Println("[AUTH_MIDDLEWARE] status:", claims.Status)

		c.Set("user_id", claims.UserID)
		c.Set("company_id", claims.CompanyID)
		c.Set("role", claims.Role)
		c.Set("status", claims.Status)

		c.Next()
	}
}
