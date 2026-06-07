# Backend Go - Plataforma de Saúde Mental

Backend desenvolvido em Go para uma plataforma de triagem inicial de saúde mental corporativa.

O objetivo do projeto é permitir que empresas possam contratar um plano, cadastrar colaboradores, aplicar formulários de diagnóstico inicial e acompanhar resultados gerais de forma segura, sem acesso indevido a dados sensíveis dos colaboradores.

## Tecnologias utilizadas

* Go
* Gin
* PostgreSQL
* JWT para autenticação
* Migrations SQL
* Arquitetura modular por domínio

## Estrutura inicial do projeto

```txt
backend-go/
│
├── cmd/
│   └── server/
│       └── main.go
│
├── internal/
│   ├── assessments/
│   │   ├── answers/
│   │   ├── forms/
│   │   ├── questions/
│   │   └── results/
│   │
│   ├── audit/
│   ├── auth/
│   ├── checkout/
│   ├── companies/
│   ├── config/
│   ├── dashboard/
│   ├── database/
│   ├── middleware/
│   ├── payments/
│   ├── plans/
│   ├── router/
│   ├── shared/
│   ├── subscriptions/
│   └── users/
│
├── migrations/
│
├── .env
├── .gitignore
├── go.mod
├── go.sum
└── README.md
```

## Organização da arquitetura

O projeto segue uma estrutura modular, separando as responsabilidades por domínio.

Cada módulo principal poderá conter:

```txt
handler.go      // Recebe as requisições HTTP
service.go      // Contém as regras de negócio
repository.go   // Faz comunicação com o banco de dados
model.go        // Representa as entidades/tabelas
dto.go          // Define dados de entrada e saída da API
```

## Principais módulos

### Auth

Responsável por login, autenticação, geração de token JWT e validação de acesso.

### Users

Responsável pelo gerenciamento dos usuários da plataforma, incluindo administrador do sistema, administrador da empresa e colaboradores.

### Companies

Responsável pelo cadastro e gerenciamento das empresas contratantes.

### Plans

Responsável pela gestão dos planos disponíveis na plataforma.

### Checkout

Responsável pela criação de sessões de pagamento vinculadas ao usuário, empresa e plano escolhido.

### Payments

Responsável pelo controle de pagamentos e integração com gateway externo.

### Subscriptions

Responsável pelo gerenciamento das assinaturas das empresas.

### Assessments

Responsável pelos formulários, perguntas, respostas e resultados das avaliações de saúde mental.

### Audit

Responsável pelo registro de logs de ações importantes do sistema.

## Fluxo principal do MVP

1. Visitante escolhe um plano.
2. Empresa e responsável são cadastrados com status pendente.
3. Sistema gera uma sessão de checkout.
4. Pagamento é realizado.
5. Gateway confirma o pagamento via webhook.
6. Empresa e assinatura são ativadas.
7. Administrador da empresa acessa o painel.
8. Administrador cadastra colaboradores.
9. Colaborador responde o formulário de diagnóstico.
10. Sistema gera classificação inicial.
11. Empresa visualiza apenas resultados resumidos.

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis necessárias:

```env
APP_PORT=8080
APP_ENV=development

DATABASE_URL=postgres://postgres:senha@localhost:5432/mental_health?sslmode=disable

JWT_SECRET=sua_chave_secreta
```

## Como rodar o projeto

Instale as dependências:

```bash
go mod tidy
```

Execute o servidor:

```bash
go run ./cmd/server
```

O servidor será iniciado na porta configurada no `.env`.

Exemplo:

```txt
http://localhost:8080
```

## Status do projeto

Projeto em fase inicial de estruturação.

Primeiro commit contendo:

* Estrutura inicial de pastas
* Organização modular do backend
* Configuração base do projeto Go
* Preparação para autenticação, empresas, planos, pagamentos, assinaturas e avaliações

## Observação

Este backend faz parte de um MVP. A primeira versão será desenvolvida com foco em simplicidade, segurança e validação do fluxo principal da plataforma.
