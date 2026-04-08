# Controle Financeiro

Aplicação de finanças pessoais com Next.js (App Router), API interna e arquitetura modular em TypeScript.

link do projeto https://liberdade-financeira-henna.vercel.app/

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- JWT + bcryptjs
- Persistência local em JSON (por usuário)

## Arquitetura Atual

### Camadas principais

- app: páginas e rotas HTTP
- app/api: endpoints REST da aplicação
- lib/types: contratos de domínio
- lib/constants: regras e dicionários centrais
- lib/utils: funções puras reutilizáveis
- lib/auth + lib/middleware: autenticação e autorização

### Estrutura resumida

- app/layout.tsx
- app/page.tsx
- app/auth/login/page.tsx
- app/auth/register/page.tsx
- app/auth/forgot-password/page.tsx
- app/curso/page.tsx
- app/dashboard/page.tsx
- app/transactions/page.tsx
- app/api/auth/forgot-password/route.ts
- app/api/auth/login/route.ts
- app/api/auth/register/route.ts
- app/api/reports/route.ts
- app/api/transactions/route.ts
- app/api/transactions/[id]/route.ts
- lib/types/finance.ts
- lib/constants/finance.ts
- lib/utils/formatters.ts
- lib/utils/finance.ts
- lib/utils/date-range.ts
- lib/auth.ts
- lib/middleware.ts

## Funcionalidades

- Cadastro e login com JWT
- Recuperação de senha por pergunta de segurança
- CRUD completo de transações
- Classificação financeira (Ativo, Passivo, Cartão de Crédito, Poupança)
- Gêneros padrão e personalizados
- Dashboard com relatório mensal, anual ou total
- Filtros e ordenação de transações
- Tema claro/escuro global
- Área de Curso com orientações de uso e educação financeira

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Executar localmente

1. Instalar dependências

```bash
npm install
```

2. Criar ou ajustar arquivo de ambiente

```bash
# defina JWT_SECRET em .env.local
```

3. Subir aplicação

```bash
npm run dev
```

## Notas de evolução

- O projeto foi refatorado para centralizar regras de negócio em módulos compartilhados.
- Regras de formatação, categorias e classificação não ficam mais espalhadas entre páginas e APIs.
- O fluxo de recuperação de senha usa pergunta de segurança cadastrada pelo próprio usuário.
- Sem a resposta correta da pergunta de segurança não é possível recuperar a senha.
- Próximo passo recomendado: migrar persistência JSON para banco relacional mantendo os contratos em lib/types.
