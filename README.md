# Passarela — frontend

MVP de uma plataforma onde merchants de um shopping publicam flash deals e shoppers acompanham em tempo real as promoções ativas, podendo expressar interest. Projeto desenvolvido em resposta a um desafio técnico para vaga de desenvolvedor fullstack pleno.

Frontend em React 19 + Vite, consumindo a API do repositório irmão [`backend/`](../backend), containerizado com Docker (com fast refresh no desenvolvimento).

## Estado atual

Scaffold técnico: tooling (Vite, TypeScript, ESLint/Prettier, Vitest), Redux Toolkit, React Router e uma página de exemplo (`Home`, com o componente `Counter` e o reducer `health`) só para provar a integração ponta a ponta. Estrutura por camada técnica (`pages`, `store`, `routes`, `services`, `hooks`, `components`). Nenhuma feature de negócio implementada ainda.

Decisões e trade-offs completos de arquitetura estão documentados em [`.claude/CLAUDE.md`](.claude/CLAUDE.md) — vale a leitura antes de propor mudanças estruturais.

## Stack Tecnológica

- **Node.js 24 LTS**
- **Vite** + **React 19** + **TypeScript**
- **Redux Toolkit** + **react-redux**
- **React Router** (`react-router-dom`) para rotas
- **Axios** para chamadas HTTP, direto no thunk (`src/store/reducers/<nome>/thunk.ts` + `src/services/api` + `src/services/apiRoutes`)
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
