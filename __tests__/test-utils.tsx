import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { Provider } from 'react-redux'

import type { RootState } from '@/store'
import counterReducer from '@/store/reducers/counter'
import healthReducer from '@/store/reducers/health'

/** Store novo por teste, com os mesmos reducers do app. */
function setupStore(preloadedState?: RootState) {
  return configureStore({
    reducer: { counter: counterReducer, health: healthReducer },
    preloadedState
  })
}

/** Opções de `renderWithStore`. */
interface RenderWithStoreOptions {
  preloadedState?: RootState
}

/** `render()` do Testing Library já envolto num `Provider` com store isolado. */
export function renderWithStore(ui: ReactElement, { preloadedState }: RenderWithStoreOptions = {}) {
  const store = setupStore(preloadedState)

  function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper }) }
}
