# Passarela (frontend) — Guia do Projeto

Frontend do **Passarela**, MVP de uma plataforma onde lojistas de um shopping publicam ofertas relâmpago e compradores acompanham em tempo real as promoções ativas, podendo expressar interesse. Projeto desenvolvido para um desafio técnico de vaga (dev fullstack pleno). Consome a API do bounded-context `backend/` (Nest), repositório irmão com git próprio — ver `backend/.claude/CLAUDE.md` para o contrato da API.

## Índice

1. [Estado atual](#estado-atual)
2. [Stack e Versões](#stack-e-versões)
3. [Arquitetura](#arquitetura)
4. [Path Aliases](#path-aliases)
5. [Convenções de Código](#convenções-de-código)
6. [Testes](#testes)
7. [Docker](#docker)
8. [Planejamento](#planejamento)
9. [Idioma](#idioma)

---

## Estado atual

Scaffold técnico via `npm create vite@latest -- --template react-ts`, com ESLint/Prettier trocando o `oxlint` padrão do template (pra ficar consistente com o `backend/`), Vitest + Testing Library, Redux Toolkit e React Router. Estrutura por camada técnica: `pages`, `store` (reducers + thunks), `hooks`, `routes`, `services` (`api` + `apiRoutes`), `components`.

Uma página de exemplo (`Home`) integra as peças ponta a ponta: página (`src/pages/Home/index.tsx`) dispara `dispatch(fetchHealth())` num `useEffect` → thunk (`src/store/reducers/health/thunk.ts`) chama `axiosApi.get` direto, usando o path de `src/services/apiRoutes/health`, contra o `GET /` real do `backend/` → slice (`health`) trata `pending`/`fulfilled`/`rejected` → hook de página (`useHome.ts`, sem `useEffect`) só lê o resultado via seletor → página renderiza, junto do componente `Counter` (Redux Toolkit + `antd` + `styled-components`). Nenhuma feature de negócio implementada ainda — `Home`/`counter`/`health` são só prova de integração, a remover quando não fizerem mais sentido como referência.

---

## Stack e Versões

| Item                     | Versão instalada em 2026-07-05 | Reconfirmar com                           |
| ------------------------ | ------------------------------ | ----------------------------------------- |
| Node.js                  | 24.14.0 (LTS "Krypton")        | `node -v` / `.nvmrc`                      |
| npm                      | 11.11.0                        | `npm -v`                                  |
| Vite                     | 8.1.x                          | `npm view vite version`                   |
| React / ReactDOM         | 19.2.x                         | `npm view react version`                  |
| TypeScript               | 6.0.x                          | `npm view typescript version`             |
| `@reduxjs/toolkit`       | 2.12.x                         | `npm view @reduxjs/toolkit version`       |
| `react-redux`            | 9.3.x                          | `npm view react-redux version`            |
| `react-router-dom`       | 7.18.x                         | `npm view react-router-dom version`       |
| `axios`                  | 1.18.x                         | `npm view axios version`                  |
| `antd`                   | 6.5.x                          | `npm view antd version`                   |
| `styled-components`      | 6.4.x                          | `npm view styled-components version`      |
| Vitest                   | 4.1.x                          | `npm view vitest version`                 |
| `@testing-library/react` | 16.3.x                         | `npm view @testing-library/react version` |
| ESLint                   | 10.6.x                         | `npm view eslint version`                 |
| `typescript-eslint`      | 8.62.x                         | `npm view typescript-eslint version`      |
| Prettier                 | 3.9.x                          | `npm view prettier version`               |

**Regra operacional**: estes números são o estado observado na criação do projeto, não valores para colar cegamente em atualizações futuras. Ao adicionar uma dependência nova, usar `npm install <pacote>@latest` e deixar o `package-lock.json` registrar a versão real resolvida — nunca copiar um número de versão de outro projeto sem reconfirmar.

### Por que essa stack

Vite + Vitest + React 19 + Redux Toolkit + Ant Design + styled-components: escolha do usuário, não reavaliada aqui. `antd` v6 já assume React 19 nativamente (peer `>=18.0.0`, sem necessidade do patch `@ant-design/v5-patch-for-react-19` que a v5 exigia). ESLint (flat config) + Prettier no lugar do `oxlint` que o template do Vite traz por padrão — mantém o mesmo par de ferramentas do `backend/`, mesmo `.prettierrc` (sem ponto e vírgula, aspas simples, `printWidth` 120, CRLF). `react-router-dom` e `axios` entraram pra dar suporte real às pastas `routes/` e `services/` (sem eles essas pastas não teriam função).

**`eslint-plugin-react` propositalmente de fora**: cobriria regras de JSX que `eslint-plugin-react-hooks`/`eslint-plugin-react-refresh` não cobrem (key em listas, `no-unescaped-entities`, etc.), mas a última versão (7.37.5) declara peer `eslint <= 9.7` — instalar com `eslint@10.6` dá conflito de peer dep. Reavaliar quando o plugin publicar suporte a eslint 10 (`npm view eslint-plugin-react peerDependencies`).

---

## Arquitetura

Estrutura por camada técnica (não DDD de 4 camadas como o `backend/`, e não 100% por feature):

- **`src/pages/<Nome>/`** — uma página por pasta, `index.tsx` como entrada. Estado derivado/leitura de seletor da página vai num hook colocado — `use<Nome>.ts` (ver regra de `useEffect`/extensão de arquivo em Convenções de Código). Ex.: `src/pages/Home/index.tsx` + `useHome.ts`.
- **`src/routes/Routes.tsx`** — mapeamento de caminho → página via `react-router-dom`. Todo `<Route>` novo aponta pra um componente em `src/pages/`.
- **`src/store/`** — `index.ts` (root reducer via `combineReducers` + `configureStore`, exporta `RootState`/`AppDispatch` e a `store` como default export) e `reducers/<nome>/` (um reducer por pasta). Duas formas, conforme o reducer envolve API ou não:
  - **Reducer local (sem API)**, ex.: `counter/` — um `index.ts` só, com o `createSlice` completo.
  - **Reducer com API**, ex.: `health/` — `types.ts` (shape do state e dos dados da API), `thunk.ts` (`createThunk` chamando `axiosApi` **direto**, com o path vindo de `src/services/apiRoutes/`), `slice.ts` (`initialState` + `extraReducers` tratando `pending`/`fulfilled`/`rejected` do thunk + seletores via `createBranchSelectors`), `index.ts` (barrel: `export { default } from '.../slice'`, com `/* v8 ignore start */` por ser puro reexport).
- **`src/utils/redux/`** — utilitários genéricos do store, meio-termo entre "criar do zero" e "instalar uma lib": `createThunk` (factory de `createAsyncThunk` com `rejectWithValue` padronizado — todo thunk usa essa factory, nunca `createAsyncThunk` cru) e `createBranchSelectors` (factory de seletores memoizados pra uma branch do `RootState`, resolvendo por uma lista de caminhos possíveis — todo slice com API exporta seus seletores através dela, nunca lendo `state.<reducer>` direto no componente).
- **`src/hooks/`** — hooks reutilizáveis em toda a aplicação. `useAppDispatch.ts`/`useAppSelector.ts` (tipados a partir de `@/store`) sempre presentes; hooks de UI genéricos (ex.: detectar mobile) entram aqui conforme necessário — um arquivo por hook, não um `hooks.ts` único.
- **`src/services/api/axiosApi.ts`** — instância única do `axios` (`baseURL` de `VITE_API_URL`), consumida só pelos `thunk.ts` de `src/store/reducers/`. Interceptors entram como `src/services/api/interceptors/` quando surgir necessidade (auth token, refresh, etc.).
- **`src/services/apiRoutes/<domínio>/index.ts`** — constantes de path da API, agrupadas por verbo HTTP: `API_<DOMÍNIO>_ROUTES = { get: {...}, post: {...}, put: {...}, delete: {...}, patch: {...} }`. Só path, nenhuma lógica — quem faz a chamada é o `thunk.ts` do reducer correspondente. Ex.: `src/services/apiRoutes/health/index.ts`.
- **`src/components/<Nome>/`** — componentes reutilizáveis entre páginas, `index.tsx` como entrada. Ainda sem subcategorias — introduzir quando o número de componentes justificar a divisão, não antes.
- **`src/theme.ts`** — tema compartilhado entre `antd` `ConfigProvider` e `styled-components` `ThemeProvider`.
- **`src/styled.d.ts`** — augmenta `DefaultTheme` do `styled-components` com o shape de `src/theme.ts`, pra `props => props.theme` vir tipado em qualquer `styled(...)`.
- **`src/App.tsx`** — composição raiz: `BrowserRouter` → `Provider` (Redux) → `ConfigProvider` (antd) → `ThemeProvider` (styled-components) → `Routes`. `src/main.tsx` só monta `<App />` em `StrictMode`, sem lógica.

Conforme features de negócio (`offers`, `interest`, WebSocket) forem entrando: uma página nova em `src/pages/`, rota nova em `src/routes/Routes.tsx`, reducer novo em `src/store/reducers/`, rotas de API novas em `src/services/apiRoutes/`.

**Persistência/criptografia de state (deferido)**: nenhum reducer daqui persiste em disco ou lida com dado sensível ainda. Quando um precisar (ex.: token de auth), adicionar `redux-persist` (+ transform de criptografia pro que for sensível) nesse momento — não instalar/estruturar isso antes de existir um reducer que realmente precise.

---

## Path Aliases

Resolvidos em dois lugares que precisam ficar sincronizados manualmente (mesmo princípio do `backend/`): `vite.config.ts` (`resolve.alias`) e `tsconfig.app.json` (`compilerOptions.paths`).

| Alias         | Aponta para                |
| ------------- | -------------------------- |
| `@/*`         | `src/*`                    |
| `@test-utils` | `__tests__/test-utils.tsx` |

Diferente do `backend/` (um alias por bounded context), aqui `@/*` cobre tudo — a estrutura por camada já deixa o import explícito (`@/services/apiRoutes/health`, `@/store/reducers/counter`). `@test-utils` é alias sem wildcard (mesmo padrão do `@config`/`@shared` do backend: módulo único, não uma família de arquivos) — só existe pra testes não precisarem de import relativo (`../../test-utils`) pra alcançar o helper de teste, que mora fora de `src/`.

---

## Convenções de Código

- **JSDoc curto**: componentes, hooks, interfaces e store (slices/thunks/reducers) sempre ganham um comentário `/** ... */` de uma linha explicando o propósito (não o "o quê", que o nome já diz). Funções soltas ganham quando relevante (lógica não óbvia só pelo nome/assinatura) — não é preciso comentar um one-liner trivial. Mesmo padrão do `backend/`.
- **Comentário informativo, não explicativo**: registra um fato sobre o código (o que é, o que garante, o que devolve) — não argumenta a favor de uma escolha nem repete uma regra já documentada aqui. Se o comentário justifica ("porque é mais barato", "evita X", "sempre use Y em vez de Z") em vez de descrever, corta a justificativa; ela é prosa de commit/CLAUDE.md, não de código. Ex.: `/** Regras de estilo */` certo, `/** Regras de estilo, sem impacto em correção — barato de manter consistente */` errado.
- **JSDoc multi-linha**: quando não cabe em uma linha, formato bloco — `/**` sozinho na primeira linha, cada linha de conteúdo começando com `* `, `*/` sozinho na última. Nunca `/** ... texto longo ... */` tudo numa linha só.
- **Zero imports relativos**: sempre via alias (`@/...` em `src/`, `@test-utils` em `__tests__/`), mesmo para arquivos vizinhos na mesma pasta.
- **Nunca `eslint-disable`**: se o ESLint reclama, o código é ajustado pra satisfazer a regra, não suprimido (ex.: `src/styled.d.ts` usa `export type DefaultTheme = AppTheme` em vez de `interface DefaultTheme extends AppTheme {}` pra não esbarrar em `@typescript-eslint/no-empty-object-type`).
- **Hooks tipados**: sempre `useAppDispatch`/`useAppSelector` de `@/hooks/...`, nunca `useDispatch`/`useSelector` crus de `react-redux` (perde a tipagem de `RootState`/`AppDispatch`).
- **Slices Redux Toolkit**: `createSlice` com Immer (mutação direta no reducer é segura), actions nomeadas no particípio (`incremented`, não `increment`) — convenção oficial do Redux Toolkit.
- **A chamada HTTP mora no `thunk.ts`, não numa camada de "serviço" separada**: `thunk.ts` importa `axiosApi` (`@/services/api/axiosApi`) e o path de `src/services/apiRoutes/<domínio>/`, e chama `axiosApi.get/post/...` direto. Não criar uma função intermediária tipo `getX()` só pra encapsular essa mesma chamada — é indireção sem ganho, o thunk já é o único lugar que faz essa chamada.
- **Toda conexão com a API é via thunk + `dispatch`, nunca `useState`/`useEffect` chamando `axiosApi` direto na página/hook de página.** Fluxo obrigatório: página faz `dispatch(fetchX())` → thunk (`src/store/reducers/<nome>/thunk.ts`, via `createThunk`) chama `axiosApi` → slice trata `pending`/`fulfilled`/`rejected` (`loading`/`data`/`error` no state) → hook de página lê o resultado com `useAppSelector` + seletor de `createBranchSelectors`, nunca guardando o retorno da API em `useState` local.
  - **Por quê**: centraliza loading/erro no Redux (inspecionável no DevTools, reusável entre componentes que precisem do mesmo dado) em vez de espalhar estado de requisição pela árvore de componentes.
  - **Exemplo real**: `src/pages/Home/index.tsx` despacha `fetchHealth` (de `@/store/reducers/health/thunk`) num `useEffect`; `useHome.ts` só lê `selectHealthData`/`selectHealthError` (de `@/store/reducers/health/slice`) — nenhum dos dois chama `axiosApi` nem guarda o resultado em `useState`.
- **`useEffect` mora por padrão no componente (`.tsx`), não no hook colocado da página.** Hook de página (`use<Nome>`) é pra leitura/derivação de estado (seletores, `useMemo`, etc.) — side effect (disparar um `dispatch`, assinar um listener) fica no `index.tsx` que consome o hook. Quando os `useEffect`s de uma página crescem (mais de um, dependências complexas), ficam mais fáceis de acompanhar declarados direto no componente do que escondidos dentro de um hook customizado.
  - **Extensão do arquivo do hook**: `use<Nome>.ts` por padrão. Só vira `.tsx` se o hook genuinamente retornar/usar JSX (raro) — um hook que só retorna dados/funções não precisa de `.tsx`.

---

## Testes

- **Espelhados em `__tests__/` na raiz do repo** (não colocados ao lado do código) — mesma convenção do `backend/`: `__tests__/` reflete `src/` 1:1. Ex.: `src/store/reducers/health/slice.ts` → `__tests__/store/reducers/health/healthSlice.spec.ts`. Utils genéricos (`src/utils/redux/createThunk`, `createBranchSelectors`) também têm spec próprio, testados isolados (sem depender de nenhum slice real).
- **Sufixo `.spec.ts`/`.spec.tsx`** — igual ao `backend/`, pra manter os dois repositórios consistentes entre si nesse ponto.
- **Cabeçalho obrigatório "Cenários testados"**: todo `*.spec.ts`/`*.spec.tsx` abre com um bloco JSDoc listando os cenários cobertos naquele arquivo (ver `__tests__/store/reducers/health/healthSlice.spec.ts` para o formato). Mesmo padrão do `backend/`. Lista atualizada manualmente sempre que um `describe`/`it` for adicionado, editado ou removido.
- **Framework**: Vitest + Testing Library (`@testing-library/react` + `@testing-library/user-event` + `jest-dom`).
- **`jest-dom` via `__tests__/setup.ts`**: carregado por `test.setupFiles` em `vite.config.ts`, expõe matchers tipo `toBeInTheDocument()`. Também precisa estar em `tsconfig.app.json` → `compilerOptions.types` (`@testing-library/jest-dom`) e `__tests__` precisa estar em `tsconfig.app.json` → `include`, senão `tsc -b` (rodado no `npm run build`) não enxerga a augmentação nem type-checa os specs.
- **`vite.config.ts` → `test.include`** restringe explicitamente a `__tests__/**/*.spec.{ts,tsx}` — evita que alguém volte a colocar teste ao lado do código por engano (padrão default do Vitest aceitaria os dois).
- **Idioma**: todo `describe`/`it` em pt-BR com acentuação.
- **Store isolado por teste**: usar `renderWithStore()` de `@test-utils`, não importar a `store` singleton de `@/store` diretamente em teste.
- **Mock de HTTP no teste do thunk**: `vi.mock('@/services/api/axiosApi', ...)` no `*.spec.ts` do `thunk.ts`, nunca teste batendo na API real (ver `__tests__/store/reducers/health/healthThunk.spec.ts`).

---

## Docker

Desenvolvimento preferencial via Docker, mas tudo deve funcionar fora dele também.

```bash
cp .env.example .env
docker compose up --build   # Vite dev server (fast refresh via bind mount de src/ e __tests__/), porta 4000
```

Fora do Docker:

```bash
cp .env.example .env
npm install
npm run dev
```

**Porta 4000 fixa**: `vite.config.ts` define `server.port: 4000` com `strictPort: true` (não cai pra outra porta livre se 4000 estiver ocupada — falha explicitamente em vez de subir num lugar inesperado). `Dockerfile`/`docker-compose.yml`/`.env.example` seguem a mesma porta.

`Dockerfile` tem 3 estágios: `development` (Vite dev server, usado pelo `docker-compose.yml`), `build` (`npm run build`) e `production` (Nginx servindo o `dist/` estático — usado só se/quando este frontend for containerizado pra produção). Estágio `production` usa `nginxinc/nginx-unprivileged` (não a imagem `nginx` oficial): master e workers rodam como usuário `nginx` (uid 101), porta 8080 em vez de 80.

**Rede com o backend**: `frontend/` e `backend/` são repositórios (e `docker-compose.yml`) independentes, cada um com sua própria rede Docker — não há rede compartilhada entre os dois compose. A comunicação acontece via porta publicada no host: `VITE_API_URL` (`.env.example`) aponta pra `http://localhost:3000`, que funciona tanto com o backend rodando fora do Docker quanto dentro (o `backend/docker-compose.yml` já publica a porta 3000 no host).

---

## Planejamento

Todo plano de implementação (modo de planejamento do Claude Code) é salvo em
`frontend/.claude/plans/*.md` — nunca no diretório global de planos do usuário. Nome do
arquivo em pt-BR kebab-case, mesmo padrão do `backend/.claude/plans/`.

---

## Idioma

Documentação e comentários em **pt-BR com acentuação**. Identificadores de código (variáveis, funções, classes) em inglês, como de costume.
