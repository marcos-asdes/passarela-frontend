# Passarela — frontend, dashboard do merchant + feed do shopper + WebSocket + rename

## Contexto

O desafio técnico exige dois perfis chamados **merchant** e **shopper** (hoje o frontend
usa `seller`/`customer`), um dashboard onde o merchant lista/cria suas offers e vê quantos
interessados cada uma tem, e um feed onde o shopper lista offers ativas, registra interest e
recebe notificações em tempo real de offers novas via WebSocket. A contraparte no backend
(bounded contexts `offers`/`interest`, gateway WebSocket, rename dos papéis) está em
`backend/.claude/plans/plano-offers-interest-websocket.md` — os endpoints e o contrato de
dados descritos ali são a fonte da verdade pros DTOs/thunks deste plano.

Decisões já fechadas com o usuário (mesmas do plano do backend):
- Interest é idempotente (1 por shopper por offer) — segunda tentativa do mesmo par é
  rejeitada (o backend devolve 409; a UI já trata isso desabilitando o botão depois do
  sucesso, sem depender só do erro do servidor).
- Offer esgotada (`sold_out`) some do feed do shopper (o filtro `status=active` do backend
  já resolve isso — o frontend só precisa listar `GET /offers` sem filtro manual extra).

---

## Parte 0 — Rename `seller`/`customer` → `merchant`/`shopper`

- `src/store/reducers/auth/types.ts`: `UserRole.Seller`/`Customer` → `Merchant`/`Shopper`
  (valores `'merchant'`/`'shopper'`, espelhando o backend).
- Rename de pastas/arquivos (mantendo a mesma estrutura, só troca de nome):
  `pages/SellerLogin` → `pages/MerchantLogin`, `pages/SellerRegister` → `pages/
  MerchantRegister` (+ `useSellerRegister.ts` → `useMerchantRegister.ts`), `pages/
  CustomerLogin` → `pages/ShopperLogin`, `pages/CustomerRegister` → `pages/
  ShopperRegister` (+ `useCustomerRegister.ts` → `useShopperRegister.ts`).
- `src/routes/Routes.tsx`: atualizar os `lazy(() => import(...))` pros novos nomes de pasta.
- **Rotas em português (`/lojista/entrar`, `/cliente/entrar`, etc.) permanecem como estão** —
  já são a tradução do termo de negócio, não uma cópia literal de `seller`/`customer`; o
  rename pedido é dos identificadores/enum, não da URL amigável em PT-BR. `Landing`/
  `PersonaCard` (textos "Sou lojista"/"Sou cliente") também não mudam por esse motivo.
- Atualizar a seção "Estado atual" do `CLAUDE.md` refletindo os novos nomes de papel.

---

## Parte 1 — reducers novos

### `src/store/reducers/offers/`
Mesma receita do `auth/` (`types.ts`/`thunk.ts`/`slice.ts`/`index.ts`, thunks via
`createThunk` — `src/utils/redux/createThunk` —, chamando `axiosApi` direto com paths de
`src/services/apiRoutes/offers/`):
- `fetchMyOffersThunk` (`GET /offers/mine`), `createOfferThunk` (`POST /offers`),
  `closeOfferThunk` (`POST /offers/:id/close`), `fetchPublicOffersThunk` (`GET /offers`).
- Estado: `mine: { loading, error, items }`, `create: { loading, error }`, `public: {
  loading, error, items }`. Nenhum desses precisa persistir (`redux-persist` fica só com
  `auth.login`, como já é hoje) — são dados de servidor, não estado de formulário.
- Ação síncrona extra no slice (sem thunk): `offerReceived` — usada pelo cliente WebSocket
  pra dar prepend de uma offer nova em `public.items` sem precisar de refetch.

### `src/store/reducers/interest/`
`registerInterestThunk` (`POST /interest`) + estado `{ loading, error,
registeredOfferIds }` (pra já desabilitar/marcar o botão "Tenho interesse" localmente depois
do sucesso, sem esperar um refetch).

Seletores dos dois reducers via `createBranchSelectors` (`src/utils/redux/
createBranchSelectors`), igual o padrão de `auth`.

---

## Parte 2 — cliente WebSocket

`socket.io-client` novo em `package.json`. `src/services/socket/offersSocket.ts`: cria a
conexão (`io(`${VITE_API_URL}/offers`)`) sob demanda — não conectado globalmente, só quando
`ShopperFeed` monta. A conexão/desconexão mora dentro de `useShopperFeed.ts` (regra do
projeto: lógica sempre no hook, nunca no `index.tsx`), num `useEffect` que desconecta no
cleanup. Evento `offer:created` despacha `offerReceived` (ação síncrona do slice `offers`,
ver Parte 1) e dispara `notification.info` do antd (`AntApp`, já disponível via `App.tsx`).

---

## Parte 3 — páginas novas

### `src/pages/MerchantDashboard/` (rota `/lojista/painel`)
`useMerchantDashboard.ts` faz `dispatch(fetchMyOffersThunk())` no mount. Lista as offers do
merchant com `interestCount` por linha. Botão "Nova offer" abre um formulário (`Modal`/
`Drawer` do antd) que despacha `createOfferThunk`. Botão "Encerrar" por offer despachando
`closeOfferThunk`.

### `src/pages/ShopperFeed/` (rota `/cliente/ofertas`)
`useShopperFeed.ts` faz `dispatch(fetchPublicOffersThunk())` no mount + conecta o WebSocket
(Parte 2). Lista offers ativas com botão "Tenho interesse" por offer, despachando
`registerInterestThunk` (desabilita o botão daquela offer via `registeredOfferIds` depois do
sucesso).

### Guard de rota por papel
`Routes.tsx` ainda não tem nenhuma rota protegida hoje — este é o primeiro caso. Criar
`src/routes/RequireRole/` (componente simples que lê `auth.login.user` via
`useAppSelector`/seletor de `createBranchSelectors`, redireciona pra `/` se não autenticado
ou se `role` não bater com o esperado, senão renderiza `children`/`<Outlet />`). Envolver
`MerchantDashboard` com `<RequireRole role="merchant">` e `ShopperFeed` com `<RequireRole
role="shopper">` em `Routes.tsx`.

### Redirecionamento pós-login
Hoje `useLoginForm.ts` não navega pra lugar nenhum específico depois do login. Ajustar pra
navegar pra `/lojista/painel` ou `/cliente/ofertas` conforme `user.role` na resposta de
`loginThunk`.

---

## Arquivos-chave a criar

`src/store/reducers/offers/*`, `src/store/reducers/interest/*`,
`src/services/apiRoutes/offers/index.ts`, `src/services/apiRoutes/interest/index.ts`,
`src/services/socket/offersSocket.ts`, `src/pages/MerchantDashboard/*`,
`src/pages/ShopperFeed/*`, `src/routes/RequireRole/*`, `src/routes/Routes.tsx` (edição).

---

## Testes

Specs de slice/thunk dos dois reducers novos (mock de `axiosApi` via
`vi.mock('@/services/api/axiosApi', ...)`, mesmo padrão de
`__tests__/store/reducers/auth/`), espelhados em `__tests__/store/reducers/offers/` e
`__tests__/store/reducers/interest/`. Spec do `RequireRole` (redireciona sem sessão,
redireciona com papel errado, renderiza com papel certo) — `renderWithStore()` de
`@test-utils`. Cabeçalho "Cenários testados", `describe`/`it` em pt-BR, sufixo `.spec.ts`/
`.spec.tsx`.

## Verificação

1. `npm run lint` + `npm test` passando.
2. `docker compose up --build` (frontend e backend); registrar um merchant e um shopper.
3. Login do merchant → redireciona pro dashboard; criar uma offer; login do shopper (outra
   aba/navegador) → feed mostra a offer ativa.
4. Com o feed do shopper aberto, merchant cria outra offer → aparece no feed em tempo real
   (notificação + item novo no topo), sem recarregar a página.
5. Shopper clica "Tenho interesse" → botão desabilita; dashboard do merchant (refresh)
   mostra `interestCount` atualizado; clicar de novo no mesmo shopper/offer não decrementa
   de novo.
6. Merchant encerra uma offer → some do feed do shopper na próxima listagem.
7. Atualizar `README.md` com as decisões de UI assumidas (guard de rota simples por papel,
   sem middleware de autorização mais sofisticado — MVP).
