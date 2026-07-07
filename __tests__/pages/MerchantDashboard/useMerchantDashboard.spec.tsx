/**
 * Testes unitários para useMerchantDashboard
 *
 * Cenários testados:
 * - busca as offers do merchant no mount
 * - sem merchant autenticado, não conecta o socket
 * - com merchant autenticado, conecta o socket e refaz a busca em offer:updated/offer:interest-changed
 * - ao desmontar, desconecta o socket
 * - handleSoftReload refaz a busca
 * - handleClose despacha closeOfferThunk com o id da offer
 * - handleCreateSubmit: em caso de sucesso fecha o modal; em falha mantém aberto
 * - isPastDate: true pra data passada, false pra data futura
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { act, renderHook, waitFor } from '@testing-library/react'
import dayjs from 'dayjs'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { isPastDate, useMerchantDashboard } from '@/pages/MerchantDashboard/useMerchantDashboard'
import { axiosApi } from '@/services/api/axiosApi'
import { createMerchantSocket } from '@/services/socket/merchantSocket'
import authReducer from '@/store/reducers/auth'
import type { AuthState } from '@/store/reducers/auth/types'
import { UserRole } from '@/store/reducers/auth/types'
import offersReducer from '@/store/reducers/offers'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn() }
}))

vi.mock('@/services/socket/merchantSocket', () => ({
  createMerchantSocket: vi.fn()
}))

function buildStore(loggedIn: boolean) {
  const emptyLoginSession = { loading: false, error: null, accessToken: null, user: null }
  const emptyProfileSession = { loading: false, error: null, name: null, email: null }
  const authState: AuthState = {
    register: { loading: false, error: null, success: false },
    login: {
      [UserRole.Merchant]: {
        loading: false,
        error: null,
        accessToken: loggedIn ? 'token-123' : null,
        user: loggedIn ? { id: 'merchant-1', role: UserRole.Merchant } : null
      },
      [UserRole.Shopper]: emptyLoginSession
    },
    profile: { [UserRole.Merchant]: emptyProfileSession, [UserRole.Shopper]: emptyProfileSession }
  }
  const rootReducer = combineReducers({ auth: authReducer, offers: offersReducer })
  return configureStore({ reducer: rootReducer, preloadedState: { auth: authState } })
}

function buildSocket() {
  return { on: vi.fn(), disconnect: vi.fn() }
}

function renderUseMerchantDashboard(store: ReturnType<typeof buildStore>) {
  function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return <Provider store={store}>{children}</Provider>
  }
  return renderHook(() => useMerchantDashboard(), { wrapper: Wrapper })
}

describe('useMerchantDashboard', () => {
  beforeEach(() => {
    vi.mocked(axiosApi.get).mockReset().mockResolvedValue({ data: [] })
    vi.mocked(axiosApi.post).mockReset()
    vi.mocked(createMerchantSocket).mockReset()
  })

  it('busca as offers do merchant no mount', async () => {
    const store = buildStore(true)
    vi.mocked(createMerchantSocket).mockReturnValue(buildSocket() as never)

    renderUseMerchantDashboard(store)

    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledWith('/offers/mine', { role: UserRole.Merchant }))
  })

  it('sem merchant autenticado, não conecta o socket', async () => {
    const store = buildStore(false)

    renderUseMerchantDashboard(store)
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalled())

    expect(createMerchantSocket).not.toHaveBeenCalled()
  })

  it('com merchant autenticado, conecta o socket e refaz a busca nos eventos', async () => {
    const store = buildStore(true)
    const socket = buildSocket()
    vi.mocked(createMerchantSocket).mockReturnValue(socket as never)

    renderUseMerchantDashboard(store)
    await waitFor(() => expect(createMerchantSocket).toHaveBeenCalledWith('merchant-1'))
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(1))

    const updatedHandler = socket.on.mock.calls.find(([event]) => event === 'offer:updated')?.[1] as () => void
    act(() => updatedHandler())
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(2))

    const interestHandler = socket.on.mock.calls.find(
      ([event]) => event === 'offer:interest-changed'
    )?.[1] as () => void
    act(() => interestHandler())
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(3))
  })

  it('ao desmontar, desconecta o socket', async () => {
    const store = buildStore(true)
    const socket = buildSocket()
    vi.mocked(createMerchantSocket).mockReturnValue(socket as never)

    const { unmount } = renderUseMerchantDashboard(store)
    await waitFor(() => expect(createMerchantSocket).toHaveBeenCalled())

    unmount()

    expect(socket.disconnect).toHaveBeenCalledTimes(1)
  })

  it('handleSoftReload refaz a busca', async () => {
    const store = buildStore(true)
    vi.mocked(createMerchantSocket).mockReturnValue(buildSocket() as never)
    const { result } = renderUseMerchantDashboard(store)
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(1))

    act(() => result.current.handleSoftReload())

    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(2))
  })

  it('handleClose despacha closeOfferThunk com o id da offer', async () => {
    const store = buildStore(true)
    vi.mocked(createMerchantSocket).mockReturnValue(buildSocket() as never)
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { id: 'offer-1', status: 'closed' } })
    const { result } = renderUseMerchantDashboard(store)

    await result.current.handleClose('offer-1')

    expect(axiosApi.post).toHaveBeenCalledWith('/offers/offer-1/close', undefined, { role: UserRole.Merchant })
  })

  it('handleCreateSubmit fecha o modal em caso de sucesso', async () => {
    const store = buildStore(true)
    vi.mocked(createMerchantSocket).mockReturnValue(buildSocket() as never)
    vi.mocked(axiosApi.post).mockResolvedValue({
      data: { id: 'offer-1', title: 'Oferta', status: 'active' }
    })
    const { result } = renderUseMerchantDashboard(store)

    act(() => result.current.handleOpenModal())
    expect(result.current.isModalOpen).toBe(true)

    await act(async () => {
      await result.current.handleCreateSubmit({
        title: 'Oferta',
        description: 'Descrição',
        discountPercent: 10,
        stock: 5,
        validUntil: dayjs()
      })
    })

    expect(result.current.isModalOpen).toBe(false)
  })

  it('handleCreateSubmit mantém o modal aberto em caso de falha', async () => {
    const store = buildStore(true)
    vi.mocked(createMerchantSocket).mockReturnValue(buildSocket() as never)
    vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 500 } })
    const { result } = renderUseMerchantDashboard(store)

    act(() => result.current.handleOpenModal())

    await act(async () => {
      await result.current.handleCreateSubmit({
        title: 'Oferta',
        description: 'Descrição',
        discountPercent: 10,
        stock: 5,
        validUntil: dayjs()
      })
    })

    expect(result.current.isModalOpen).toBe(true)
  })

  it('isPastDate: true pra data passada, false pra data futura', () => {
    expect(isPastDate(dayjs().subtract(1, 'day'))).toBe(true)
    expect(isPastDate(dayjs().add(1, 'day'))).toBe(false)
  })
})
