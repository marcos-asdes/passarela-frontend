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

Primeira feature de negócio real: cadastro e login, pros dois papéis (merchant/shopper, rotas em pt-BR `/lojista`/`/cliente`). `Landing` (`/`) direciona pra 4 páginas de auth (`/lojista/entrar`, `/lojista/cadastro`, `/cliente/entrar`, `/cliente/cadastro`), cada uma compondo `AuthCard` + `LoginForm`/`RegisterForm` (`src/components/`) contra o reducer `auth` (`src/store/reducers/auth/`), que fala com `POST /auth/login`/`POST /auth/register` do `backend/`. `auth.login` (accessToken + user) é persistido via `redux-persist` (criptografado fora de dev — ver seção Arquitetura) pra sobreviver a um refresh; `auth.register` não é persistido, é só estado de formulário. Login redireciona pro dashboard/feed do papel certo (`useLoginForm`).

Segunda feature: dashboard do merchant (`/lojista/painel`) e feed do shopper (`/cliente/ofertas`), ambas atrás do guard `RequireRole` (`src/routes/RequireRole/`, primeira rota protegida do projeto — redireciona pra `/` sem sessão ou com papel errado). Dois reducers novos: `offers` (`mine`/`create`/`close`/`public`) e `interest` (`registeredOfferIds`), seguindo a mesma receita `types.ts`/`thunk.ts`/`slice.ts`/`index.ts` do `auth`. `MerchantDashboard` lista offers próprias com contagem de interest, cria via modal, encerra manualmente. `ShopperFeed` lista offers ativas, registra interest e conecta um socket (`socket.io-client`, `src/services/socket/offersSocket.ts`) ao namespace `/offers` do backend pra receber `offer:created` em tempo real (prepend na lista + notificação antd), aberto/fechado só enquanto a página está montada (`useShopperFeed`).

**Interceptor de autenticação** (`src/services/api/interceptors/authToken.interceptor.ts`): `/offers` (exceto o feed público) e `/interest` exigem JWT, então o `axiosApi` precisa anexar `Authorization: Bearer <token>` em toda request autenticada. Isso não pode ler o token direto do `@/store` (thunks → `axiosApi` já são importados pelo próprio store, então importar `@/store` de volta de dentro do axios fecha um ciclo de módulos ES que quebra em runtime — "Cannot access 'X' before initialization" num carregamento a frio, mesmo funcionando em HMR incremental). Solução: `src/services/api/authToken.ts` é um holder simples (`let` + getter/setter) fora do grafo do Redux; `store/index.ts` sincroniza esse valor via `store.subscribe(...)` sempre que `auth.login.accessToken` muda, e o interceptor só lê `getAccessToken()`. **Cuidado ao editar qualquer um desses 3 arquivos**: reintroduzir um import de `@/store` dentro de `src/services/api/**` reabre o ciclo.

---

## Stack e Versões

| Item                              | Versão instalada em 2026-07-05 | Reconfirmar com                                    |
| --------------------------------- | ------------------------------ | -------------------------------------------------- |
| Node.js                           | 24.14.0 (LTS "Krypton")        | `node -v` / `.nvmrc`                               |
| npm                               | 11.11.0                        | `npm -v`                                           |
| Vite                              | 8.1.x                          | `npm view vite version`                            |
| React / ReactDOM                  | 19.2.x                         | `npm view react version`                           |
| TypeScript                        | 6.0.x                          | `npm view typescript version`                      |
| `@reduxjs/toolkit`                | 2.12.x                         | `npm view @reduxjs/toolkit version`                |
| `react-redux`                     | 9.3.x                          | `npm view react-redux version`                     |
| `react-router-dom`                | 7.18.x                         | `npm view react-router-dom version`                |
| `axios`                           | 1.18.x                         | `npm view axios version`                           |
| `antd`                            | 6.5.x                          | `npm view antd version`                            |
| `@ant-design/icons`               | 6.3.x                          | `npm view @ant-design/icons version`               |
| `styled-components`               | 6.4.x                          | `npm view styled-components version`               |
| `dayjs`                           | 1.11.x                         | `npm view dayjs version`                           |
| `redux-persist`                   | 6.0.x                          | `npm view redux-persist version`                   |
| `redux-persist-transform-encrypt` | 5.1.x                          | `npm view redux-persist-transform-encrypt version` |
| `socket.io-client`                | 4.8.x                          | `npm view socket.io-client version`                |
| Vitest                            | 4.1.x                          | `npm view vitest version`                          |
| `@testing-library/react`          | 16.3.x                         | `npm view @testing-library/react version`          |
| ESLint                            | 10.6.x                         | `npm view eslint version`                          |
| `typescript-eslint`               | 8.62.x                         | `npm view typescript-eslint version`               |
| Prettier                          | 3.9.x                          | `npm view prettier version`                        |

**Regra operacional**: estes números são o estado observado na criação do projeto, não valores para colar cegamente em atualizações futuras. Ao adicionar uma dependência nova, usar `npm install <pacote>@latest` e deixar o `package-lock.json` registrar a versão real resolvida — nunca copiar um número de versão de outro projeto sem reconfirmar.

### Por que essa stack

Vite + Vitest + React 19 + Redux Toolkit + Ant Design + styled-components: escolha do usuário, não reavaliada aqui. `antd` v6 já assume React 19 nativamente (peer `>=18.0.0`, sem necessidade do patch `@ant-design/v5-patch-for-react-19` que a v5 exigia). ESLint (flat config) + Prettier no lugar do `oxlint` que o template do Vite traz por padrão — mantém o mesmo par de ferramentas do `backend/`, mesmo `.prettierrc` (sem ponto e vírgula, aspas simples, `printWidth` 120, CRLF). `react-router-dom` e `axios` entraram pra dar suporte real às pastas `routes/` e `services/` (sem eles essas pastas não teriam função).

**`eslint-plugin-react` propositalmente de fora**: cobriria regras de JSX que `eslint-plugin-react-hooks`/`eslint-plugin-react-refresh` não cobrem (key em listas, `no-unescaped-entities`, etc.), mas a última versão (7.37.5) declara peer `eslint <= 9.7` — instalar com `eslint@10.6` dá conflito de peer dep. Reavaliar quando o plugin publicar suporte a eslint 10 (`npm view eslint-plugin-react peerDependencies`).

---

## Arquitetura

Estrutura por camada técnica (não DDD de 4 camadas como o `backend/`, e não 100% por feature):

- **`src/pages/<Nome>/`** — uma página por pasta, `index.tsx` como entrada. Estado derivado/leitura de seletor da página vai num hook colocado — `use<Nome>.ts` (ver regra de `useEffect`/extensão de arquivo em Convenções de Código); só existe quando a página precisa de fato (nenhuma página atual precisou ainda). Ex.: `src/pages/Landing/index.tsx`.
- **`src/routes/Routes.tsx`** — mapeamento de caminho → página via `react-router-dom`. Todo `<Route>` novo aponta pra um componente em `src/pages/`. Só a página da primeira tela (`Landing`, rota `/`) é import estático — todas as outras entram via `lazy(() => import('@/pages/<Nome>'))`, cada uma virando um chunk próprio no build, dentro do `<Suspense fallback={<LoadingFallback />}>` que envolve o `<ReactDOMRoutes>`. Mantém o carregamento inicial leve conforme o número de páginas cresce.
- **`src/store/`** — `index.ts` (root reducer via `combineReducers` + `configureStore`, exporta `RootState`/`AppDispatch` e a `store` como default export) e `reducers/<nome>/` (um reducer por pasta). Duas formas, conforme o reducer envolve API ou não:
  - **Reducer local (sem API)** — um `index.ts` só, com o `createSlice` completo. Nenhum reducer atual é puramente local.
  - **Reducer com API**, ex.: `auth/` — `types.ts` (shape do state e dos dados da API), `thunk.ts` (`createThunk` chamando `axiosApi` **direto**, com o path vindo de `src/services/apiRoutes/`), `slice.ts` (`initialState` + `extraReducers` tratando `pending`/`fulfilled`/`rejected` do thunk + seletores via `createBranchSelectors`), `index.ts` (barrel: `export { default } from '.../slice'`, com `/* v8 ignore start */` por ser puro reexport).
- **`src/utils/redux/`** — utilitários genéricos do store, meio-termo entre "criar do zero" e "instalar uma lib": `createThunk` (factory de `createAsyncThunk` com `rejectWithValue` padronizado — todo thunk usa essa factory, nunca `createAsyncThunk` cru) e `createBranchSelectors` (factory de seletores memoizados pra uma branch do `RootState`, resolvendo por uma lista de caminhos possíveis — todo slice com API exporta seus seletores através dela, nunca lendo `state.<reducer>` direto no componente).
- **`src/hooks/`** — hooks reutilizáveis em toda a aplicação. `useAppDispatch.ts`/`useAppSelector.ts` (tipados a partir de `@/store`) sempre presentes; hooks de UI genéricos (ex.: detectar mobile) entram aqui conforme necessário — um arquivo por hook, não um `hooks.ts` único.
- **`src/services/api/axiosApi.ts`** — instância única do `axios` (`baseURL` de `VITE_API_URL`), consumida só pelos `thunk.ts` de `src/store/reducers/`. Interceptors entram como `src/services/api/interceptors/` quando surgir necessidade (auth token, refresh, etc.).
- **`src/services/apiRoutes/<domínio>/index.ts`** — constantes de path da API, agrupadas por verbo HTTP: `API_<DOMÍNIO>_ROUTES = { get: {...}, post: {...}, put: {...}, delete: {...}, patch: {...} }`. Só path, nenhuma lógica — quem faz a chamada é o `thunk.ts` do reducer correspondente. Ex.: `src/services/apiRoutes/auth/index.ts`.
- **`src/components/<Nome>/`** — componentes reutilizáveis entre páginas, `index.tsx` como entrada. Ainda sem subcategorias — introduzir quando o número de componentes justificar a divisão, não antes. Botões, inputs e outros elementos de UI sempre viram um component aqui (mesmo sendo wrapper fino sobre o antd) — página nunca monta `<Button>`/`<Input>` do antd direto, só via `@/components/Button`, `@/components/Input` etc., pra ter um lugar único de customização.
- **`styles.ts` ao lado de todo `index.tsx` que usa styled-components** — `index.tsx` (de página ou component) só tem componente + chamadas de hook + `useEffect`; toda definição `styled.div`/`styled(Componente)` mora no `styles.ts` irmão, importado como `import * as S from '@/pages/<Nome>/styles'` (ou `@/components/<Nome>/styles`) e consumido como `<S.Nome>`. `index.tsx` nunca importa `styled-components` diretamente. Ex.: `src/components/AuthCard/index.tsx` + `styles.ts`.
- **`src/theme.ts`** — tema compartilhado entre `antd` `ConfigProvider` e `styled-components` `ThemeProvider`.
- **`src/styled.d.ts`** — estende `DefaultTheme` do `styled-components` (por fora da lib, sem editar o código dela) com o shape de `src/theme.ts`, pra `props => props.theme` vir tipado em qualquer `styled(...)`.
- **`src/App.tsx`** — composição raiz: `BrowserRouter` → `Provider` (Redux) → `ConfigProvider` (antd, com `locale={ptBR}`) → `ThemeProvider` (styled-components) → `AntApp` (contexto de tema pras funções estáticas `message`/`notification`/`Modal`) → `PersistGate` (bloqueia a árvore até o redux-persist reidratar o state, com `LoadingFallback` como fallback) → `Routes`. `src/main.tsx` só monta `<App />` em `StrictMode`, sem lógica.

Conforme features de negócio novas forem entrando: uma página nova em `src/pages/`, rota nova em `src/routes/Routes.tsx` (protegida via `RequireRole` quando exigir sessão/papel específico), reducer novo em `src/store/reducers/`, rotas de API novas em `src/services/apiRoutes/`. Exemplo real: `offers`/`interest` (dashboard do merchant, feed do shopper).

**Persistência/criptografia de state**: por padrão, nenhum reducer persiste em disco — só entra reducer novo em `store/index.ts` (`persistReducer` + `whitelist`) quando ele realmente guarda algo que precisa sobreviver a um refresh (ex.: `auth.login`, pelo `accessToken`/`user`; `auth.register` fica de fora, é estado transiente de formulário). Sempre com `whitelist` explícito pro sub-estado necessário, nunca a reducer inteira por padrão. Criptografia (`src/utils/redux/persistEncryption`, `redux-persist-transform-encrypt`) só entra fora de dev (`import.meta.env.DEV`) — em dev o state persiste em texto puro, de propósito, pra inspecionar o localStorage sem descriptografar nada. Chave em `VITE_REDUX_PERSIST_ENCRYPTION_KEY` (`.env`/`.env.example`). Ações do redux-persist (`FLUSH`/`REHYDRATE`/`PAUSE`/`PERSIST`/`PURGE`/`REGISTER`) entram no `ignoredActions` do `serializableCheck` do RTK em `configureStore` — carregam valor não serializável de propósito, não é bug.

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
- **`types.ts` sempre**: toda `interface`/`type` vive em um `types.ts` próprio da pasta — nunca inline em `index.tsx`/`styles.ts` (mesma regra do `backend/`). Vale pra props de component (`ButtonProps`), valores de formulário (`LoginFormValues`) etc. Exceções: `src/theme.ts` (o `type AppTheme` é derivado do próprio `theme` que o arquivo declara) e `src/store/index.ts` (`RootState`/`AppDispatch` idem, derivados da `store`) — ambos já são um arquivo de definição única, não um component/page com lógica.
- **Nunca `eslint-disable` inline**: se o ESLint reclama, o código é ajustado pra satisfazer a regra ou a regra é reconfigurada no escopo certo do `eslint.config.js` — nunca suprimido linha a linha. Ex.: `interface DefaultTheme extends AppTheme {}` em `src/styled.d.ts` é o jeito oficial (documentado pelo próprio styled-components) de estender, por fora da lib, o `DefaultTheme` que ela já declara (usar `type DefaultTheme = AppTheme` no lugar não funciona — compila, mas `props.theme` fica sem a tipagem de `AppTheme`). Como isso sempre esbarra em `@typescript-eslint/no-empty-object-type`, `eslint.config.js` desliga essa regra só pra `src/styled.d.ts`, não via comentário no arquivo.
- **Hooks tipados**: sempre `useAppDispatch`/`useAppSelector` de `@/hooks/...`, nunca `useDispatch`/`useSelector` crus de `react-redux` (perde a tipagem de `RootState`/`AppDispatch`).
- **Slices Redux Toolkit**: `createSlice` com Immer (mutação direta no reducer é segura), actions nomeadas no particípio (`incremented`, não `increment`) — convenção oficial do Redux Toolkit.
- **A chamada HTTP mora no `thunk.ts`, não numa camada de "serviço" separada**: `thunk.ts` importa `axiosApi` (`@/services/api/axiosApi`) e o path de `src/services/apiRoutes/<domínio>/`, e chama `axiosApi.get/post/...` direto. Não criar uma função intermediária tipo `getX()` só pra encapsular essa mesma chamada — é indireção sem ganho, o thunk já é o único lugar que faz essa chamada.
- **Toda conexão com a API é via thunk + `dispatch`, nunca `useState`/`useEffect` chamando `axiosApi` direto na página/hook de página.** Fluxo obrigatório: página faz `dispatch(fetchX())` → thunk (`src/store/reducers/<nome>/thunk.ts`, via `createThunk`) chama `axiosApi` → slice trata `pending`/`fulfilled`/`rejected` (`loading`/`data`/`error` no state) → hook de página lê o resultado com `useAppSelector` + seletor de `createBranchSelectors`, nunca guardando o retorno da API em `useState` local.
  - **Por quê**: centraliza loading/erro no Redux (inspecionável no DevTools, reusável entre componentes que precisem do mesmo dado) em vez de espalhar estado de requisição pela árvore de componentes.
  - **Exemplo real**: `src/store/reducers/auth/thunk.ts` (`registerThunk`/`loginThunk`) chama `axiosApi` direto; `slice.ts` trata `pending`/`fulfilled`/`rejected`; `useLoginForm`/`useRegisterForm` (ver regra seguinte) só leem `selectLoginError`/`selectRegisterError` via `useAppSelector` — nenhum componente guarda o resultado da API em `useState` local.
- **Regra de negócio, estado e callbacks sempre no hook, nunca no `index.tsx`**: todo `use<Nome>.ts` (de page ou de component) concentra `useState`, `useEffect`, dispatch/seletores do Redux e os handlers (`handleSubmit`, `handleClick` etc.) — `index.tsx` só desestrutura o retorno do hook e renderiza JSX, nunca declara lógica própria. Todo component/page com estado ou callback ganha um `use<Nome>.ts` irmão (ex.: `LoginForm` → `useLoginForm.ts`); sem estado/callback (só composição de JSX, ex.: `AuthCard`, `Landing`), não precisa de hook. O shape do retorno do hook vira uma interface `Use<Nome>Return` em `types.ts` (regra de `types.ts` acima).
  - **Extensão do arquivo do hook**: `use<Nome>.ts` por padrão. Só vira `.tsx` se o hook genuinamente retornar/usar JSX (raro) — um hook que só retorna dados/funções não precisa de `.tsx`.
- **Toda função que um `use<Nome>.ts` devolve é envolvida em `useCallback`**, com array de dependências exaustivo e tipo de retorno explícito no corpo do callback — mantém a referência da função estável entre renders, o que importa quando ela vira dependência de outro efeito ou é passada a um componente memoizado. Ex.: `useLoginForm`/`usePersonaCard`.
- **Tipagem explícita é o padrão do projeto**: componentes, funções nomeadas e hooks sempre declaram o tipo de retorno explícito (`: ReactNode` pra component, `: Promise<void>`/`: void`/etc. pra função solta, `: Use<Nome>Return` pra hook) — nunca deixado pro TS inferir sozinho. `useState` sempre com generic explícito (`useState<boolean>(false)`, nunca `useState(false)`), mesmo quando o TS inferiria certo sem ajuda. **Exceção**: função/arrow **inline** (callback de JSX, `validator` de `Form.Item` do antd, builder do `extraReducers`) — processo intermediário de lib de terceiro complexo demais pra anotar sem reescrever o tipo dela; `eslint.config.js` libera essas via `allowExpressions`/`allowTypedFunctionExpressions` em `@typescript-eslint/explicit-function-return-type`, então só a declaração nomeada (component, função solta, hook) é obrigatória.

---

## Testes

- **Espelhados em `__tests__/` na raiz do repo** (não colocados ao lado do código) — mesma convenção do `backend/`: `__tests__/` reflete `src/` 1:1. Ex.: `src/store/reducers/health/slice.ts` → `__tests__/store/reducers/health/healthSlice.spec.ts`. Utils genéricos (`src/utils/redux/createThunk`, `createBranchSelectors`) também têm spec próprio, testados isolados (sem depender de nenhum slice real).
- **Sufixo `.spec.ts`/`.spec.tsx`** — igual ao `backend/`, pra manter os dois repositórios consistentes entre si nesse ponto.
- **Cabeçalho obrigatório "Cenários testados"**: todo `*.spec.ts`/`*.spec.tsx` abre com um bloco JSDoc listando os cenários cobertos naquele arquivo (ver `__tests__/store/reducers/health/healthSlice.spec.ts` para o formato). Mesmo padrão do `backend/`. Lista atualizada manualmente sempre que um `describe`/`it` for adicionado, editado ou removido.
- **Framework**: Vitest + Testing Library (`@testing-library/react` + `@testing-library/user-event` + `jest-dom`).
- **`jest-dom` via `__tests__/setup.ts`**: carregado por `test.setupFiles` em `vite.config.ts`, expõe matchers tipo `toBeInTheDocument()`. Também precisa estar em `tsconfig.app.json` → `compilerOptions.types` (`@testing-library/jest-dom`) e `__tests__` precisa estar em `tsconfig.app.json` → `include`, senão `tsc -b` (rodado no `npm run build`) não enxerga essa extensão de tipo nem type-checa os specs.
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
