# SASBIO — Plataforma de Saúde Mental Corporativa

Plataforma multi-tenant para triagem de riscos psicossociais no ambiente de trabalho, alinhada à **NR-01** (Norma Regulamentadora nº 1 do Ministério do Trabalho).

[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)](https://go.dev)
[![Gin](https://img.shields.io/badge/Gin-1.12-00ADD8?logo=go&logoColor=white)](https://gin-gonic.com)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)](#roadmap--próximos-passos)

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Principais funcionalidades](#principais-funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Endpoints principais](#endpoints-principais)
- [Decisões de engenharia](#decisões-de-engenharia)
- [Roadmap / próximos passos](#roadmap--próximos-passos)
- [Licença](#licença)

## Sobre o projeto

Desde 2022, a **NR-01** passou a exigir que empresas brasileiras identifiquem, avaliem e gerenciem riscos psicossociais no ambiente de trabalho (estresse, sobrecarga, esgotamento) como parte do Programa de Gerenciamento de Riscos (PGR) — no mesmo patamar de exigência de riscos físicos, químicos e ergonômicos já fiscalizados há décadas. Isso é uma obrigação regulatória real, com fiscalização ativa, e a maioria das empresas ainda não tem uma ferramenta estruturada para atendê-la.

Este projeto é uma plataforma que permite a uma empresa contratar um plano, cadastrar seus colaboradores e aplicar periodicamente um questionário de triagem psicossocial. Cada colaborador responde individualmente; a empresa enxerga apenas indicadores agregados e classificações de risco, nunca as respostas brutas — o diagnóstico completo do indivíduo é tratado como dado sensível e fica isolado por design.

O público-alvo é duplo: o **RH/administração da empresa contratante**, que precisa de visibilidade sobre o risco psicossocial da sua força de trabalho e comprovação de conformidade regulatória, e o **colaborador**, que precisa de um canal simples e confidencial para responder a triagem. O modelo de negócio é assinatura recorrente por empresa, com cobrança processada via gateway de pagamento (Asaas) e ativação automática via webhook.

## Principais funcionalidades

- **Multi-tenant real**: cada empresa opera isolada das demais; todo dado sensível (colaboradores, diagnósticos, pagamentos) é filtrado por `company_id` desde a camada de repositório.
- **Autenticação JWT com controle de papéis (RBAC)**: três papéis — `SYSTEM_ADMIN` (dono da plataforma), `COMPANY_ADMIN` (RH da empresa contratante) e `EMPLOYEE` (colaborador) — cada um com um conjunto de rotas autorizadas.
- **Onboarding comercial completo**: cadastro de empresa + admin, seleção de plano, geração de sessão de checkout, confirmação de pagamento via webhook e ativação automática da assinatura e do usuário administrador.
- **Diagnóstico psicossocial**: formulário versionado, submissão de respostas com cálculo de score, classificação de risco e histórico por colaborador — limitado a uma submissão por colaborador por dia.
- **Integração de pagamento (Asaas)**: criação de sessões de cobrança (Pix/Boleto/Cartão) e processamento assíncrono de status via webhook, com proteção contra duplicidade de eventos.
- **Histórico de pagamentos e assinaturas**: consulta de pagamentos e status de plano por empresa.
- **Dashboards por papel**: visão agregada para `COMPANY_ADMIN`/`SYSTEM_ADMIN` (dados da empresa, uso do plano, pagamentos) sem exposição de respostas individuais dos colaboradores.
- **Auditoria**: registro de ações administrativas relevantes (`audit_logs`) vinculadas a ator e empresa.

## Stack tecnológica

| Backend | Frontend | Infra / Ferramentas |
|---|---|---|
| Go 1.25 | React 19 | PostgreSQL 15+ |
| Gin 1.12 (HTTP router) | TypeScript ~6.0 | `golang-migrate` (migrations SQL versionadas) |
| pgx/v5 (driver PostgreSQL, sem ORM) | Vite 8 | Asaas (gateway de pagamento, ambiente sandbox) |
| golang-jwt/jwt v5 | React Router 7 | godotenv (config via `.env`) |
| golang.org/x/crypto (bcrypt) | TanStack Query 5 | gin-contrib/cors |
| go-playground/validator v10 | Tailwind CSS 4 | |
| | Axios · Recharts · GSAP | |

## Arquitetura

**Backend** organizado em camadas por domínio (`internal/<domínio>`), inspirado em uma arquitetura em pacotes verticais: cada domínio (`auth`, `users`, `companies`, `plans`, `checkout`, `payments`, `subscriptions`, `webhooks`, `assesments/*`, `audit`) encapsula suas próprias `routes → handler → service → repository → model/dto`, sem camada de acesso a dados compartilhada. Regras de autorização (autenticação, papel, assinatura ativa) vivem em `middleware` e são compostas no `router` conforme o nível de proteção exigido por grupo de rotas.

**Frontend** organizado por página/rota, com layouts dedicados por papel (`AdminLayout`, `CompanyLayout`, `CollaboratorLayout`, `PublicLayout`) e roteamento protegido (`ProtectedRoute`) que reflete o RBAC do backend.

```mermaid
flowchart TD
    subgraph Client["Cliente"]
        FE["Frontend React\n(por papel: público / empresa / colaborador / admin)"]
    end

    subgraph API["Backend Go (Gin)"]
        MW["Middleware\nAuth JWT -> Role -> Plano ativo"]
        H["Handler"]
        S["Service\n(regras de negócio)"]
        R["Repository\n(pgx, isolado por company_id)"]
    end

    DB[("PostgreSQL")]
    ASAAS["Asaas\n(gateway de pagamento)"]

    FE -->|"HTTPS + JWT"| MW --> H --> S --> R --> DB
    S -->|"cria cobrança"| ASAAS
    ASAAS -->|"webhook de pagamento"| H
```

Fluxo comercial de ponta a ponta: empresa se cadastra → escolhe plano → sessão de checkout é criada no Asaas → pagamento é confirmado via webhook (idempotente) → assinatura e admin da empresa são ativados na mesma transação → admin cadastra colaboradores → colaboradores respondem o diagnóstico → empresa acompanha indicadores agregados no dashboard.

## Como rodar localmente

### Pré-requisitos

- Go 1.25+
- Node.js 20+
- PostgreSQL 15+
- [`golang-migrate` CLI](https://github.com/golang-migrate/migrate) instalado e no `PATH`
- Uma conta sandbox no [Asaas](https://www.asaas.com) (opcional, apenas para testar o fluxo de pagamento)

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd Saude-Mental
```

### 2. Backend

```bash
cd backend-go

# copie o exemplo e preencha com seus valores locais
cp .env.example .env

# instale as dependências
go mod tidy

# crie o banco de dados (ajuste o nome/credenciais conforme o seu .env)
# psql -U postgres -c "CREATE DATABASE mental_health;"

# aplique as migrations
./scripts/migrate-up.ps1

# popule dados de desenvolvimento (planos ativos precisam existir antes,
# veja a nota abaixo) e um usuário de teste pronto para login
go run ./cmd/seed

# suba a API
go run ./cmd/server
```

> O seed (`cmd/seed`) cria perguntas de diagnóstico, uma empresa já ativa, um `COMPANY_ADMIN` e um `EMPLOYEE` de teste — as credenciais são impressas no terminal ao final da execução. Ele pressupõe que já exista ao menos um plano ativo na tabela `plans`; insira um plano manualmente antes de rodar o seed caso o banco esteja vazio. **Não deve ser usado em produção.**

A API sobe em `http://localhost:8080` (ou na porta definida em `APP_PORT`).

### 3. Frontend

```bash
cd frontend

cp .env.example .env

npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` (padrão do Vite) e consome a API configurada em `VITE_API_URL`.

## Variáveis de ambiente

### Backend (`backend-go/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `APP_PORT` | Porta em que a API HTTP sobe | `8080` |
| `APP_ENV` | Ambiente de execução (`development` / `production`) | `development` |
| `DATABASE_URL` | String de conexão com o PostgreSQL | `postgres://postgres:your_password@localhost:5432/mental_health?sslmode=disable` |
| `JWT_SECRET` | Segredo usado para assinar/validar os tokens JWT | `your_jwt_secret_here` |
| `ASAAS_BASE_URL` | URL base da API do Asaas (sandbox ou produção) | `https://api-sandbox.asaas.com/v3` |
| `ASAAS_API_KEY` | Chave de API do Asaas | `your_asaas_sandbox_key` |
| `ASAAS_WEBHOOK_TOKEN` | Token compartilhado para validar a autenticidade dos webhooks do Asaas | `your_asaas_webhook_token` |

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_API_URL` | URL base da API backend consumida pelo frontend | `http://localhost:8080` |

## Estrutura de pastas

```txt
Saude-Mental/
├── backend-go/
│   ├── cmd/
│   │   ├── server/          # entrypoint da API HTTP
│   │   └── seed/            # popula dados de desenvolvimento
│   ├── internal/
│   │   ├── auth/            # cadastro de empresa, login, JWT
│   │   ├── users/           # colaboradores/admins, papéis
│   │   ├── companies/       # perfil e dados agregados da empresa
│   │   ├── plans/           # catálogo de planos
│   │   ├── checkout/        # criação de sessões de pagamento (Asaas)
│   │   ├── payments/        # registro de pagamentos confirmados
│   │   ├── subscriptions/   # ciclo de vida da assinatura por empresa
│   │   ├── webhooks/        # callback assíncrono do Asaas
│   │   ├── assesments/      # formulário, perguntas, respostas e resultados
│   │   ├── dashboard/       # indicadores agregados por empresa
│   │   ├── audit/           # log de ações administrativas
│   │   ├── middleware/      # autenticação, papel, assinatura ativa
│   │   ├── router/          # composição das rotas e grupos de proteção
│   │   ├── config/          # carregamento de variáveis de ambiente
│   │   ├── database/        # conexão com PostgreSQL (pgx)
│   │   └── shared/security/ # JWT e hashing de senha
│   ├── migrations/          # migrations SQL versionadas (golang-migrate)
│   └── scripts/             # wrappers PowerShell para golang-migrate
└── frontend/
    └── src/
        ├── pages/
        │   ├── landingPage/  # site público (marketing)
        │   ├── Auth/         # login, cadastro, recuperação de senha
        │   ├── admin/        # área do SYSTEM_ADMIN
        │   ├── empresa/      # área do COMPANY_ADMIN
        │   ├── colaborador/  # área do EMPLOYEE
        │   └── pagamento/    # fluxo de checkout e status de pagamento
        ├── components/
        │   ├── layout/       # layouts por papel + navegação
        │   ├── auth/         # roteamento protegido (RBAC no frontend)
        │   └── ui/           # componentes de UI reutilizáveis
        └── lib/              # cliente HTTP, sessão/token, regras de classificação
```

## Endpoints principais

Prefixo comum: `/api/v1`. Todas as rotas autenticadas exigem `Authorization: Bearer <token>`.

| Domínio | Método | Rota | Papel exigido | Descrição |
|---|---|---|---|---|
| Auth | `POST` | `/auth/register-company` | Público | Cadastra empresa + usuário admin (status pendente) |
| Auth | `POST` | `/auth/login` | Público | Autentica e retorna JWT |
| Planos | `GET` | `/plans/all-active` | Público | Lista planos disponíveis para contratação |
| Checkout | `POST` | `/checkout/create-session` | Autenticado | Cria sessão de pagamento no Asaas para o plano escolhido |
| Webhooks | `POST` | `/webhooks/asaas` | Token do webhook | Callback assíncrono de status de pagamento |
| Empresa | `GET` | `/companies/me` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Perfil da empresa logada |
| Empresa | `GET` | `/companies/plans-dashboard` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Dados do plano/assinatura vigente |
| Empresa | `GET` | `/companies/payments` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Histórico de pagamentos da empresa |
| Dashboard | `GET` | `/dashboard/company` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Indicadores agregados de diagnóstico da empresa |
| Colaboradores | `POST` | `/users/create-employee` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Cadastra novo colaborador |
| Colaboradores | `GET` | `/users/list-employees` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Lista colaboradores da empresa |
| Colaboradores | `PATCH` | `/users/:id/deactivate` | `COMPANY_ADMIN`, `SYSTEM_ADMIN` | Desativa um colaborador |
| Colaboradores | `GET` | `/users/me` | Autenticado | Perfil do usuário logado |
| Diagnóstico | `GET` | `/diagnostic/form` | Autenticado + assinatura ativa | Retorna o formulário ativo (versão vigente) |
| Diagnóstico | `POST` | `/diagnostic/submit-form` | Autenticado + assinatura ativa | Envia respostas, calcula score e classificação |
| Diagnóstico | `GET` | `/diagnostic/history` | Autenticado + assinatura ativa | Histórico de diagnósticos do colaborador |

## Decisões de engenharia

- **Isolamento multi-tenant por `company_id`**: em vez de um esquema por cliente, o isolamento é garantido no nível de repositório/query — toda tabela sensível (`users`, `checkout_sessions`, `payments`, `subscriptions`, `diagnostic_tests`, `audit_logs`) carrega `company_id` e nenhuma consulta de listagem cruza empresas. Papéis exigidos são checados via middleware componível (`AuthMiddleware → RequireRole → RequireActivePlan`), aplicado seletivamente por grupo de rotas no `router`.
- **Webhook de pagamento idempotente**: o Asaas pode reenviar o mesmo evento. A confirmação de pagamento roda em uma única transação (`tx`) que (1) marca a sessão como paga apenas se ainda não estava, (2) insere o pagamento com `ON CONFLICT` na constraint única de `provider_payment_id` — se o evento já foi processado, a inserção é ignorada e nada é reativado — e (3) só então ativa assinatura e admin da empresa. Qualquer falha em qualquer etapa faz rollback de tudo.
- **Uma assinatura ativa por empresa, garantida pelo banco**: um índice único parcial (`WHERE status = 'active'`) na tabela `subscriptions` impede duas assinaturas ativas simultâneas para a mesma empresa — a regra de negócio é reforçada estruturalmente, não só na aplicação.
- **Diagnóstico versionado**: `diagnostic_questions` guarda `form_version`, e cada `diagnostic_tests` registra o `form_version` e o `scoring_version` usados naquela submissão. Isso permite evoluir o questionário e o algoritmo de classificação de risco sem invalidar o histórico já respondido.
- **Uma submissão por colaborador por dia**: reforçado por um índice único funcional sobre a data (fuso `America/Sao_Paulo`) da submissão, evitando múltiplas respostas no mesmo dia mesmo sob concorrência.
- **Arquitetura em camadas por domínio**: cada módulo de negócio é autocontido (`handler → service → repository`), o que mantém o acoplamento entre domínios explícito (via injeção de repositórios de outros pacotes) em vez de implícito por acesso direto ao banco.

## Roadmap / próximos passos

- Instrumento de avaliação psicossocial completo alinhado aos 10 fatores de risco da NR-01 (hoje o formulário de seed cobre um subconjunto reduzido, apenas com perguntas de escala 1–5).
- Suporte a perguntas do tipo `yes_no` e `multiple_choice` no motor de scoring (atualmente implementado só para `scale_1_5`).
- Fluxo de recuperação/redefinição de senha (telas já existem no frontend, endpoint ainda não implementado no backend).
- Área administrativa (`SYSTEM_ADMIN`) para gestão de empresas, planos e formulários diretamente pela plataforma.
- Suíte de testes automatizados (unitários e de integração) para os domínios críticos (auth, webhooks, scoring).
- Pipeline de deploy (containerização + CI/CD).

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.
