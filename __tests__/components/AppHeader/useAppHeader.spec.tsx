/**
 * Testes unitários para useAppHeader
 *
 * Cenários testados:
 * - busca o perfil (fetchProfileThunk) do papel quando ainda não tem nome
 * - não refaz a busca depois de uma falha (guarda profileError contra retry infinito)
 * - cartCount reflete a quantidade de interests registrados
 * - lê nome/e-mail do papel certo, sem se misturar com o perfil do outro papel
 * - handleLogout: revoga a sessão do papel, limpa o estado local daquele papel e navega pra "/"
 * - handleLogout: mesmo com logoutThunk falhando, limpa o estado local (best-effort)
 * - visible vira false ao rolar pra baixo além do threshold, volta true ao rolar pra cima
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppHeader } from '@/components/AppHeader/useAppHeader'
import { axiosApi } from '@/services/api/axiosApi'
import authReducer, { initialState as authInitialState } from '@/store/reducers/auth/slice'
import { UserRole } from '@/store/reducers/auth/types'
import interestReducer from '@/store/reducers/interest'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn() }
}))

const rootReducer = combineReducers({ auth: authReducer, interest: interestReducer })

function buildStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

function renderUseAppHeader(store: ReturnType<typeof buildStore>, role: UserRole = UserRole.Shopper) {
  function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    )
  }
  return renderHook(() => useAppHeader(role), { wrapper: Wrapper })
}

describe('useAppHeader', () => {
  beforeEach(() => {
    vi.mocked(axiosApi.get).mockReset()
    vi.mocked(axiosApi.post).mockReset()
  })

  it('busca o perfil do papel quando ainda não tem nome', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    const store = buildStore()

    renderUseAppHeader(store, UserRole.Shopper)

    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledWith('/auth/me', { role: UserRole.Shopper }))
  })

  it('não refaz a busca depois de uma falha', async () => {
    vi.mocked(axiosApi.get).mockRejectedValue(new Error('sessão expirada'))
    const store = buildStore()

    const { rerender } = renderUseAppHeader(store)
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(1))

    rerender()
    rerender()

    expect(axiosApi.get).toHaveBeenCalledTimes(1)
  })

  it('cartCount reflete a quantidade de interests registrados', () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    const store = buildStore({
      interest: { fetchLoading: false, pendingOfferIds: [], error: null, registeredInterests: { a: '1', b: '2' } }
    })

    const { result } = renderUseAppHeader(store)

    expect(result.current.cartCount).toBe(2)
  })

  it('lê nome/e-mail do papel certo, sem se misturar com o perfil do outro papel', () => {
    const store = buildStore({
      auth: {
        ...authInitialState,
        profile: {
          [UserRole.Merchant]: { loading: false, error: null, name: 'João', email: 'joao@teste.com' },
          [UserRole.Shopper]: { loading: false, error: null, name: 'Maria', email: 'maria@teste.com' }
        }
      }
    })

    const { result } = renderUseAppHeader(store, UserRole.Shopper)

    expect(result.current.name).toBe('Maria')
    expect(result.current.email).toBe('maria@teste.com')
  })

  it('handleLogout revoga a sessão do papel, limpa o estado local e navega', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    vi.mocked(axiosApi.post).mockResolvedValue({ data: undefined })
    const store = buildStore({
      auth: {
        ...authInitialState,
        login: {
          ...authInitialState.login,
          [UserRole.Shopper]: {
            loading: false,
            error: null,
            accessToken: 'token',
            user: { id: 'user-1', role: UserRole.Shopper }
          }
        }
      }
    })
    const { result } = renderUseAppHeader(store, UserRole.Shopper)

    await result.current.handleLogout()

    expect(axiosApi.post).toHaveBeenCalledWith('/auth/logout', undefined, { role: UserRole.Shopper })
    expect(store.getState().auth.login[UserRole.Shopper].accessToken).toBeNull()
  })

  it('handleLogout limpa o estado local mesmo com logoutThunk falhando', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    vi.mocked(axiosApi.post).mockRejectedValue(new Error('sessão já expirada'))
    const store = buildStore()
    const { result } = renderUseAppHeader(store, UserRole.Shopper)

    await result.current.handleLogout()

    expect(store.getState().auth.login[UserRole.Shopper].accessToken).toBeNull()
  })

  it('visible vira false ao rolar pra baixo além do threshold, volta true ao rolar pra cima', () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 0
    })
    const store = buildStore()
    const { result } = renderUseAppHeader(store)

    Object.defineProperty(globalThis, 'scrollY', { value: 200, configurable: true })
    act(() => globalThis.dispatchEvent(new Event('scroll')))
    expect(result.current.visible).toBe(false)

    Object.defineProperty(globalThis, 'scrollY', { value: 50, configurable: true })
    act(() => globalThis.dispatchEvent(new Event('scroll')))
    expect(result.current.visible).toBe(true)

    rafSpy.mockRestore()
  })
})
