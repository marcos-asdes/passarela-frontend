import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { Provider } from 'react-redux'

import authReducer from '@/store/reducers/auth'
import type { AuthState } from '@/store/reducers/auth/types'

const reducer = { auth: authReducer }

/** Shape do estado do store de teste — sem o `persistReducer` que envolve `auth` no store real. */
interface TestState {
  auth: AuthState
}

/**
 * Tipo de retorno via `ReturnType<typeof configureStore<...>>` (não `EnhancedStore<S>` de mão) —
 * preserva o `ThunkDispatch` que o `configureStore` já inclui por padrão nos middlewares.
 */
type TestStore = ReturnType<typeof configureStore<TestState>>

/** Store novo por teste, com os mesmos reducers do app (sem o wrapper de persistência). */
function setupStore(preloadedState?: TestState): TestStore {
  return configureStore({ reducer, preloadedState })
}

/** Opções de `renderWithStore`. */
interface RenderWithStoreOptions {
  preloadedState?: TestState
}

/**
 * Retorno de `renderWithStore`: resultado do Testing Library + store isolado usado no teste.
 * Derivado via `ReturnType<typeof render>` (não uma interface `RenderResult` de mão) — o `render()`
 * real devolve queries vinculadas (`getByLabelText` etc.) que uma interface hand-rolled perde.
 */
type RenderWithStoreResult = ReturnType<typeof render> & { store: TestStore }

/** `render()` do Testing Library já envolto num `Provider` com store isolado. */
export function renderWithStore(
  ui: ReactElement,
  { preloadedState }: RenderWithStoreOptions = {}
): RenderWithStoreResult {
  const store = setupStore(preloadedState)

  function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }

  /**
   * `render()` é sobrecarregado (overload) — no call site, com `{ wrapper }` e sem `queries`, o TS
   * resolve pro overload genérico com `Q` não inferido, perdendo os métodos de busca (`getByLabelText`
   * etc.) que existem em runtime. Cast pro tipo real (mesmo caso raro de lib de terceiro complexa
   * demais pra anotar sem reescrever o tipo dela, igual `extraReducers` do Redux Toolkit).
   */
  return { store, ...render(ui, { wrapper: Wrapper }) } as RenderWithStoreResult
}
