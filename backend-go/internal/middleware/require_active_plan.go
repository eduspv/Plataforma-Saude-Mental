package middleware

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// IsPlanActive checa se a company tem subscription ativa e vigente no banco.
// Retorna (true, nil) se tem plano ativo, (false, nil) se não tem, (false, err) se deu erro.
// "Não tem plano" NÃO é erro — é uma resposta válida.
func IsPlanActive(ctx context.Context, db *pgxpool.Pool, companyID string) (bool, error) {
	var one int
	err := db.QueryRow(ctx, `
		SELECT 1
		FROM subscriptions
		WHERE company_id = $1
		  AND status = 'active'
		  AND current_period_end IS NOT NULL
		  AND current_period_end > NOW()
		LIMIT 1
	`, companyID).Scan(&one)

	if errors.Is(err, pgx.ErrNoRows) {
		// Não achou linha = não tem plano ativo. Não é erro, é resposta.
		return false, nil
	}
	if err != nil {
		// Erro real (banco fora, timeout, etc)
		return false, err
	}
	return true, nil
}

// Roles que ignoram a checagem de plano ativo.
// Admin do sistema não é dono de company e existe fora do fluxo comercial.
var rolesExemptFromPlanCheck = map[string]bool{
	"SYSTEM_ADMIN": true,
}

// RequireActivePlan bloqueia requests quando a company do usuário logado
// não tem subscription ativa e vigente. Deve ser aplicado APÓS AuthMiddleware.
func RequireActivePlan(db *pgxpool.Pool) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		roleStr, _ := role.(string)

		if rolesExemptFromPlanCheck[roleStr] {
			log.Printf("[PLAN_MIDDLEWARE] role=%s isento — liberado", roleStr)
			c.Next()
			return
		}

		companyID, exists := c.Get("company_id")
		companyIDStr, _ := companyID.(string)
		if !exists || companyIDStr == "" {
			log.Printf("[PLAN_MIDDLEWARE] company_id ausente no contexto — negando")
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "usuário sem empresa vinculada",
			})
			c.Abort()
			return
		}

		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()

		active, err := IsPlanActive(ctx, db, companyIDStr)
		if err != nil {
			// Erro real no banco → nega por segurança (fail-closed)
			log.Printf("[PLAN_MIDDLEWARE] erro ao checar plano company_id=%s err=%v", companyIDStr, err)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"success": false,
				"message": "erro ao validar assinatura",
			})
			c.Abort()
			return
		}

		if !active {
			log.Printf("[PLAN_MIDDLEWARE] company_id=%s sem plano ativo — bloqueando", companyIDStr)
			c.JSON(http.StatusPaymentRequired, gin.H{
				"success": false,
				"message": "assinatura inativa ou vencida",
				"code":    "SUBSCRIPTION_INACTIVE",
			})
			c.Abort()
			return
		}

		log.Printf("[PLAN_MIDDLEWARE] company_id=%s com plano ativo — liberado", companyIDStr)
		c.Next()
	}
}
