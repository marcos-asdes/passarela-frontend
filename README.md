# Passarela — frontend

MVP de uma plataforma onde merchants de um shopping publicam flash deals e shoppers acompanham em tempo real as promoções ativas, podendo expressar interest. Projeto desenvolvido em resposta a um desafio técnico para vaga de desenvolvedor fullstack pleno.

Frontend em React 19 + Vite, consumindo a API do repositório irmão [`backend/`](../backend), containerizado com Docker (com fast refresh no desenvolvimento).

## Estado atual

MVP completo do desafio, consumindo a API do repositório irmão [`backend/`](../backend). Cadastro/login pros dois papéis (merchant/shopper), dashboard do merchant (cria/encerra offers, vê contagem de interest) e feed do shopper (lista offers ativas, registra interest e recebe offers novas em tempo real via WebSocket). Estrutura por camada técnica (`pages`, `store`, `routes`, `services`, `hooks`, `components`).

Decisões e trade-offs completos de arquitetura estão documentados em [`.claude/CLAUDE.md`](.claude/CLAUDE.md) e nos planos em [`.claude/plans/`](.claude/plans/) — vale a leitura antes de propor mudanças estruturais.

### Páginas

| Rota | Papel | Descrição |
|---|---|---|
| `/` | — | Landing, direciona pra login/cadastro de cada papel |
| `/lojista/entrar`, `/lojista/cadastro` | — | Login/cadastro do merchant |
| `/cliente/entrar`, `/cliente/cadastro` | — | Login/cadastro do shopper |
| `/lojista/painel` | merchant | Dashboard: lista/cria/encerra offers, vê interessados |
| `/cliente/ofertas` | shopper | Feed: offers ativas, registra interest, WebSocket em tempo real |

`/lojista/painel` e `/cliente/ofertas` são protegidas por `RequireRole` (`src/routes/RequireRole/`) — sem sessão ou com papel errado, redireciona pra `/`.

### Decisões técnicas e trade-offs assumidos

- **Autenticação via interceptor do axios, não por thunk**: `src/services/api/interceptors/authToken.interceptor.ts` anexa `Authorization: Bearer <token>` em toda request. O token não é lido direto do `@/store` — os `thunk.ts` dos reducers já importam `axiosApi`, então o `@/store` importar de volta o axios fecha um ciclo de módulos ES que quebra em runtime (funciona em HMR incremental, quebra num carregamento a frio — "Cannot access 'X' before initialization"). A solução é um holder simples (`src/services/api/authToken.ts`, fora do grafo do Redux) sincronizado via `store.subscribe(...)` em `store/index.ts`.
- **`RequireRole` é um guard simples**, sem lógica de refresh de token/expiração — suficiente pro MVP (o próprio backend já invalida sessão revogada/expirada, devolvendo 401, que os thunks traduzem em mensagem de erro).
- **Dashboard do merchant não tem UI de edição** (`PATCH /offers/:id` existe no backend, mas o MVP só expõe criar/encerrar pela interface) — escopo reduzido de propósito pelo tempo do desafio.
- **WebSocket conectado só enquanto o feed está montado** (`useShopperFeed`), não uma conexão global da aplicação — evita manter socket aberto em telas que não precisam dele.

## Stack Tecnológica

- **Node.js 24 LTS**
- **Vite** + **React 19** + **TypeScript**
- **Redux Toolkit** + **react-redux**
- **React Router** (`react-router-dom`) para rotas
- **Axios** para chamadas HTTP, direto no thunk (`src/store/reducers/<nome>/thunk.ts` + `src/services/api` + `src/services/apiRoutes`)
- **Socket.IO client** (`socket.io-client`) — WebSocket do feed do shopper
- **Ant Design** (componentes) + **styled-components** (estilização customizada)
- **Vitest** + **Testing Library** para testes
- **Docker** / Docker Compose (com fast refresh em desenvolvimento)

## Como Rodar (Docker — preferencial)

```bash
cp .env.example .env
docker compose up --build
```

A aplicação fica disponível em `http://localhost:4000` (porta fixa — `strictPort: true` em `vite.config.ts`). Qualquer alteração em `src/` reinicia via HMR, sem rebuild manual da imagem.

## Atalhos Docker (Makefile)

Para agilizar o dia a dia, existe um `Makefile` com os comandos principais:

```bash
make help
make up
make logs
make down
```

Comandos mais usados:

- `make up` / `make up-build` — sobe em background (sem logs; use `make logs` à parte)
- `make start` / `make start-build` — sobe em primeiro plano, com logs ao vivo (Ctrl+C derruba)
- `make build` — builda as imagens sem subir
- `make down` / `make restart`
- `make logs`
- `make ps`
- `make shell`
- `make test`
- `make lint`
- `make clean` — down com remoção de containers órfãos
- `make prune` — clean + remove volumes
- `make rebuild` — rebuild sem cache

Também dá para escolher o serviço nos logs:

```bash
make logs SERVICE=web
```

Se você estiver no Windows sem `make`, use os equivalentes com Docker Compose (ex.: `docker compose up --build`, `docker compose logs -f web`, `docker compose down`).

## Como Rodar (local, sem Docker)

```bash
cp .env.example .env
npm install
npm run dev
```

`VITE_API_URL` (`.env`) precisa apontar pro backend — ver [`.claude/CLAUDE.md`](.claude/CLAUDE.md#docker) pra combinações Docker/local.

## Testes

```bash
npm run test           # roda toda a suíte
npm run test:watch     # modo watch
npm run test:coverage  # com cobertura
```

Testes ficam em [`__tests__/`](__tests__/), espelhando a estrutura de `src/` a partir da raiz do projeto (mesma convenção do `backend/`), sufixo `.spec.ts`/`.spec.tsx`.

## Lint e formatação

```bash
npm run lint
npm run format
```

## Path Aliases

Zero imports relativos — sempre via alias: `@/*` (aponta pra `src/*`) e `@test-utils` (aponta pro helper de teste em `__tests__/test-utils.tsx`). Detalhes em [`.claude/CLAUDE.md`](.claude/CLAUDE.md#path-aliases).

## Licença

MIT.
