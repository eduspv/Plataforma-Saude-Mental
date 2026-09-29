// cmd/seed/main.go
//
// Seed de desenvolvimento: cria DUAS empresas ATIVAS, cada uma com admin +
// subscription ativa + um colaborador ATIVO, para permitir testar login e
// diagnóstico sem depender do fluxo de pagamento (Asaas/webhook).
//
// Rodar:  go run ./cmd/seed
//
// NÃO usar em produção — cria dados fixos de teste.
//
// A lógica em si vive em internal/seed, para poder ser chamada também a
// partir de testes de integração.

package main

import (
	"context"
	"fmt"
	"log"

	"backend-go/internal/config"
	"backend-go/internal/database"
	"backend-go/internal/seed"
)

func main() {
	ctx := context.Background()

	cfg := config.LoadConfig()
	db := database.Connect(cfg.DatabaseURL)
	defer db.Close()

	log.Println("[SEED] conectado ao banco")

	results, err := seed.Run(ctx, db)
	if err != nil {
		log.Fatalf("[SEED] falhou: %v", err)
	}

	fmt.Println("\n─────────────────────────────────────────")
	fmt.Println(" SEED CONCLUÍDO — empresas de teste criadas:")
	for _, r := range results {
		fmt.Printf("  Empresa:     %s\n", r.CompanyName)
		fmt.Printf("  Admin:       %s\n", r.AdminEmail)
		fmt.Printf("  Colaborador: %s\n", r.EmployeeEmail)
	}
	fmt.Println(" Senhas: consulte as constantes em internal/seed/seed.go (não impressas aqui).")
	fmt.Println("─────────────────────────────────────────")
}
