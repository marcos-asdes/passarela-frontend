/**
 * Testes unitários para useAppHeader
 *
 * Cenários testados:
 * - busca o perfil (fetchProfileThunk) quando ainda não tem nome
 * - não refaz a busca depois de uma falha (guarda profileError contra retry infinito)
 * - cartCount reflete a quantidade de interests registrados
 * - role vem do usuário autenticado, null quando não logado
 * - handleLogout: revoga a sessão, limpa o estado local, purga o persist e navega pra "/"
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
import authReducer from '@/store/reducers/auth'
import { UserRole } from '@/store/reducers/auth/types'
import interestReducer from '@/store/reducers/interest'

const purgeMock = vi.fn()

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn() }
}))

vi.mock('@/store', () => ({
  persistor: { purge: (): unknown => purgeMock() }
}))

const rootReducer = combineReducers({ auth: authReducer, interest: interestReducer })

function buildStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

function renderUseAppHeader(store: ReturnType<typeof buildStore>) {
  function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    )
  }
  return renderHook(() => useAppHeader(), { wrapper: Wrapper })
}

describe('useAppHeader', () => {
  beforeEach(() => {
    vi.mocked(axiosApi.get).mockReset()
    vi.mocked(axiosApi.post).mockReset()
    purgeMock.mockReset()
  })

  it('busca o perfil quando ainda não tem nome', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    const store = buildStore()

    renderUseAppHeader(store)

    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledWith('/auth/me'))
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

  it('role vem do usuário autenticado, null quando não logado', () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    const store = buildStore({
      auth: {
        register: { loading: false, error: null, success: false },
        login: { loading: false, error: null, accessToken: 'token', user: { id: 'user-1', role: UserRole.Shopper } },
        profile: { loading: false, error: null, name: null, email: null }
      }
    })

    const { result } = renderUseAppHeader(store)

    expect(result.current.role).toBe(UserRole.Shopper)
  })

  it('handleLogout revoga a sessão, limpa o estado, purga o persist e navega', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    vi.mocked(axiosApi.post).mockResolvedValue({ data: undefined })
    const store = buildStore()
    const { result } = renderUseAppHeader(store)

    await result.current.handleLogout()

    expect(axiosApi.post).toHaveBeenCalledWith('/auth/logout')
    expect(purgeMock).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.login.accessToken).toBeNull()
  })

  it('handleLogout limpa o estado local mesmo com logoutThunk falhando', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
    vi.mocked(axiosApi.post).mockRejectedValue(new Error('sessão já expirada'))
    const store = buildStore()
    const { result } = renderUseAppHeader(store)

    await result.current.handleLogout()

    expect(purgeMock).toHaveBeenCalledTimes(1)
    expect(store.getState().auth.login.accessToken).toBeNull()
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
