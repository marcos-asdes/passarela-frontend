import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import { App as AntApp } from 'antd'
import type { ReactElement, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import authReducer from '@/store/reducers/auth'
import interestReducer from '@/store/reducers/interest'
import offersReducer from '@/store/reducers/offers'
import { theme } from '@/theme'

/** Reducer raiz do store de teste — sem o `persistReducer` que envolve `auth` no store real. */
const rootReducer = combineReducers({ auth: authReducer, offers: offersReducer, interest: interestReducer })

/** Shape do estado do store de teste, derivado do próprio `rootReducer`. */
type TestState = ReturnType<typeof rootReducer>

/**
 * Tipo de retorno via `ReturnType<typeof configureStore<...>>` (não `EnhancedStore<S>` de mão) —
 * preserva o `ThunkDispatch` que o `configureStore` já inclui por padrão nos middlewares.
 */
type TestStore = ReturnType<typeof configureStore<TestState>>

/** Store novo por teste, com os mesmos reducers do app (sem o wrapper de persistência). */
function setupStore(preloadedState?: Partial<TestState>): TestStore {
  return configureStore({ reducer: rootReducer, preloadedState })
}

/** Opções de `renderWithStore`. */
interface RenderWithStoreOptions {
  preloadedState?: Partial<TestState>
  /** Rota inicial do `MemoryRouter` que envolve o componente — default `/`. */
  route?: string
}

/**
 * Retorno de `renderWithStore`: resultado do Testing Library + store isolado usado no teste.
 * Derivado via `ReturnType<typeof render>` (não uma interface `RenderResult` de mão) — o `render()`
 * real devolve queries vinculadas (`getByLabelText` etc.) que uma interface hand-rolled perde.
 */
type RenderWithStoreResult = ReturnType<typeof render> & { store: TestStore }

/**
 * `render()` do Testing Library já envolto num `Provider` com store isolado, `MemoryRouter` (pra
 * componentes que usam `useNavigate`/`Link`) e `AntApp` (pro contexto que `App.useApp()` consome —
 * mesmo motivo de `App.tsx` real). Um `MemoryRouter` interno de um teste específico (ex.: pra montar
 * rotas-alvo de navegação) continua funcionando aninhado a este — cada `<Routes>` resolve contra o
 * Router ancestral mais próximo.
 */
export function renderWithStore(
  ui: ReactElement,
  { preloadedState, route = '/' }: RenderWithStoreOptions = {}
): RenderWithStoreResult {
  const store = setupStore(preloadedState)

  function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <ThemeProvider theme={theme}>
            <AntApp>{children}</AntApp>
          </ThemeProvider>
        </MemoryRouter>
      </Provider>
    )
  }

  /**
   * `render()` é sobrecarregado (overload) — no call site, com `{ wrapper }` e sem `queries`, o TS
   * resolve pro overload genérico com `Q` não inferido, perdendo os métodos de busca (`getByLabelText`
   * etc.) que existem em runtime. Cast pro tipo real (mesmo caso raro de lib de terceiro complexa
   * demais pra anotar sem reescrever o tipo dela, igual `extraReducers` do Redux Toolkit).
   */
  return { store, ...render(ui, { wrapper: Wrapper }) } as RenderWithStoreResult
}
