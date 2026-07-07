/**
 * Testes unitários para useShopperFeed
 *
 * Cenários testados:
 * - busca offers públicas e interests do shopper no mount
 * - offer:created: adiciona a offer recebida e mostra notificação
 * - offer:status-changed: reflete a mudança de status na offer
 * - handleRegisterInterest/handleRemoveInterest despacham os thunks correspondentes
 * - handleToggleCartFilter alterna showOnlyInterests e reseta a página
 * - handleSoftReload refaz as duas buscas
 * - visibleOffers/pagedOffers: pagina e filtra pelos interesses registrados
 * - ao desmontar, desconecta o socket
 */

import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { act, renderHook, waitFor } from '@testing-library/react'
import { App as AntApp } from 'antd'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useShopperFeed } from '@/pages/ShopperFeed/useShopperFeed'
import { axiosApi } from '@/services/api/axiosApi'
import { createOffersSocket } from '@/services/socket/offersSocket'
import { UserRole } from '@/store/reducers/auth/types'
import interestReducer from '@/store/reducers/interest'
import offersReducer from '@/store/reducers/offers'
import type { OffersState } from '@/store/reducers/offers/types'
import { OfferStatus } from '@/store/reducers/offers/types'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn(), delete: vi.fn() }
}))

vi.mock('@/services/socket/offersSocket', () => ({
  createOffersSocket: vi.fn()
}))

function buildOffer(overrides: Partial<OffersState['public']['items'][number]> = {}) {
  return {
    id: 'offer-1',
    merchantId: 'merchant-1',
    title: '50% OFF',
    description: 'Promoção',
    discountPercent: 50,
    stock: 10,
    validUntil: '2026-12-31T00:00:00.000Z',
    status: OfferStatus.Active,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides
  }
}

function buildStore(preloadedOffers: OffersState['public']['items'] = []) {
  const rootReducer = combineReducers({ offers: offersReducer, interest: interestReducer })
  return configureStore({
    reducer: rootReducer,
    preloadedState: {
      offers: {
        mine: { loading: false, error: null, items: [] },
        create: { loading: false, error: null },
        close: { loading: false, error: null },
        public: { loading: false, error: null, items: preloadedOffers }
      }
    }
  })
}

function buildSocket() {
  return { on: vi.fn(), disconnect: vi.fn() }
}

function renderUseShopperFeed(store: ReturnType<typeof buildStore>) {
  function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
    return (
      <Provider store={store}>
        <AntApp>{children}</AntApp>
      </Provider>
    )
  }
  return renderHook(() => useShopperFeed(), { wrapper: Wrapper })
}

describe('useShopperFeed', () => {
  beforeEach(() => {
    vi.mocked(axiosApi.get).mockReset().mockResolvedValue({ data: [] })
    vi.mocked(axiosApi.post).mockReset()
    vi.mocked(axiosApi.delete).mockReset()
    vi.mocked(createOffersSocket).mockReset()
  })

  it('busca offers públicas e interests do shopper no mount', async () => {
    vi.mocked(createOffersSocket).mockReturnValue(buildSocket() as never)
    const store = buildStore()

    renderUseShopperFeed(store)

    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledWith('/offers', { params: { status: undefined } }))
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledWith('/interest/mine', { role: UserRole.Shopper }))
  })

  it('offer:created adiciona a offer recebida', async () => {
    const socket = buildSocket()
    vi.mocked(createOffersSocket).mockReturnValue(socket as never)
    const store = buildStore()

    renderUseShopperFeed(store)
    await waitFor(() => expect(createOffersSocket).toHaveBeenCalled())

    const createdHandler = socket.on.mock.calls.find(([event]) => event === 'offer:created')?.[1] as (
      offer: ReturnType<typeof buildOffer>
    ) => void
    act(() => createdHandler(buildOffer({ id: 'offer-novo' })))

    expect(store.getState().offers.public.items.some((item) => item.id === 'offer-novo')).toBe(true)
  })

  it('offer:status-changed reflete a mudança de status', async () => {
    const socket = buildSocket()
    vi.mocked(createOffersSocket).mockReturnValue(socket as never)
    vi.mocked(axiosApi.get).mockResolvedValue({ data: [buildOffer()] })
    const store = buildStore()

    renderUseShopperFeed(store)
    await waitFor(() => expect(store.getState().offers.public.items).toHaveLength(1))

    const statusHandler = socket.on.mock.calls.find(([event]) => event === 'offer:status-changed')?.[1] as (
      offer: ReturnType<typeof buildOffer>
    ) => void
    act(() => statusHandler(buildOffer({ status: OfferStatus.Expired })))

    expect(store.getState().offers.public.items[0].status).toBe(OfferStatus.Expired)
  })

  it('handleRegisterInterest despacha registerInterestThunk', async () => {
    vi.mocked(createOffersSocket).mockReturnValue(buildSocket() as never)
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { id: 'interest-1' } })
    const store = buildStore()
    const { result } = renderUseShopperFeed(store)

    await result.current.handleRegisterInterest('offer-1')

    expect(axiosApi.post).toHaveBeenCalledWith('/interest', { offerId: 'offer-1' }, { role: UserRole.Shopper })
  })

  it('handleRemoveInterest despacha removeInterestThunk', async () => {
    vi.mocked(createOffersSocket).mockReturnValue(buildSocket() as never)
    vi.mocked(axiosApi.delete).mockResolvedValue({ data: undefined })
    const store = buildStore()
    const { result } = renderUseShopperFeed(store)

    await result.current.handleRemoveInterest('offer-1')

    expect(axiosApi.delete).toHaveBeenCalledWith('/interest/offer-1', { role: UserRole.Shopper })
  })

  it('handleToggleCartFilter alterna showOnlyInterests e reseta a página', async () => {
    vi.mocked(createOffersSocket).mockReturnValue(buildSocket() as never)
    const store = buildStore()
    const { result } = renderUseShopperFeed(store)

    expect(result.current.showOnlyInterests).toBe(false)
    act(() => result.current.onPageChange(2))
    expect(result.current.currentPage).toBe(2)

    act(() => result.current.handleToggleCartFilter())

    expect(result.current.showOnlyInterests).toBe(true)
    expect(result.current.currentPage).toBe(1)
  })

  it('handleSoftReload refaz as duas buscas', async () => {
    vi.mocked(createOffersSocket).mockReturnValue(buildSocket() as never)
    const store = buildStore()
    const { result } = renderUseShopperFeed(store)
    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(2))

    act(() => result.current.handleSoftReload())

    await waitFor(() => expect(axiosApi.get).toHaveBeenCalledTimes(4))
  })

  it('pagina 8 offers por página e filtra pelos interesses registrados', async () => {
    vi.mocked(createOffersSocket).mockReturnValue(buildSocket() as never)
    const offers = Array.from({ length: 9 }, (_, i) => buildOffer({ id: `offer-${i}`, title: `Oferta ${i}` }))
    const store = buildStore(offers)
    const { result } = renderUseShopperFeed(store)

    expect(result.current.totalOffers).toBe(9)
    expect(result.current.pagedOffers).toHaveLength(8)

    act(() => result.current.handleToggleCartFilter())

    expect(result.current.totalOffers).toBe(0)
  })

  it('ao desmontar, desconecta o socket', async () => {
    const socket = buildSocket()
    vi.mocked(createOffersSocket).mockReturnValue(socket as never)
    const store = buildStore()

    const { unmount } = renderUseShopperFeed(store)
    await waitFor(() => expect(createOffersSocket).toHaveBeenCalled())

    unmount()

    expect(socket.disconnect).toHaveBeenCalledTimes(1)
  })
})
