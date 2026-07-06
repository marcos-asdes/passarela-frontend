/**
 * Testes unitários para os thunks do reducer `offers`
 *
 * Cenários testados:
 * - fetchMyOffersThunk: despacha fulfilled com a lista devolvida pela API
 * - createOfferThunk: envia o payload pro endpoint de criação e retorna a offer criada
 * - closeOfferThunk: chama o endpoint de encerramento com o id da offer
 * - fetchPublicOffersThunk: repassa o status como query param
 * - qualquer thunk: traduz erro 409 numa mensagem específica de "não pode mais ser editada"
 */

import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { axiosApi } from '@/services/api/axiosApi'
import offersReducer from '@/store/reducers/offers'
import {
  closeOfferThunk,
  createOfferThunk,
  fetchMyOffersThunk,
  fetchPublicOffersThunk
} from '@/store/reducers/offers/thunk'
import { OfferStatus } from '@/store/reducers/offers/types'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn() }
}))

function buildStore(): ReturnType<typeof configureStore<{ offers: ReturnType<typeof offersReducer> }>> {
  return configureStore({ reducer: { offers: offersReducer } })
}

const offer = {
  id: 'offer-1',
  merchantId: 'merchant-1',
  title: '50% OFF',
  description: 'Promoção',
  discountPercent: 50,
  stock: 10,
  validUntil: '2026-12-31T00:00:00.000Z',
  status: OfferStatus.Active,
  createdAt: '2026-01-01T00:00:00.000Z'
}

describe('offers thunks', () => {
  it('fetchMyOffersThunk despacha fulfilled com a lista devolvida pela API', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: [{ ...offer, interestCount: 2 }] })
    const store = buildStore()

    const action = await store.dispatch(fetchMyOffersThunk())

    expect(axiosApi.get).toHaveBeenCalledWith('/offers/mine')
    expect(fetchMyOffersThunk.fulfilled.match(action)).toBe(true)
  })

  it('createOfferThunk envia o payload e retorna a offer criada', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: offer })
    const store = buildStore()
    const payload = {
      title: offer.title,
      description: offer.description,
      discountPercent: offer.discountPercent,
      stock: offer.stock,
      validUntil: offer.validUntil
    }

    const action = await store.dispatch(createOfferThunk(payload))

    expect(axiosApi.post).toHaveBeenCalledWith('/offers', payload)
    expect(createOfferThunk.fulfilled.match(action) && action.payload).toEqual(offer)
  })

  it('closeOfferThunk chama o endpoint de encerramento com o id da offer', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { ...offer, status: OfferStatus.Closed } })
    const store = buildStore()

    await store.dispatch(closeOfferThunk('offer-1'))

    expect(axiosApi.post).toHaveBeenCalledWith('/offers/offer-1/close')
  })

  it('fetchPublicOffersThunk repassa o status como query param', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: [] })
    const store = buildStore()

    await store.dispatch(fetchPublicOffersThunk(OfferStatus.SoldOut))

    expect(axiosApi.get).toHaveBeenCalledWith('/offers', { params: { status: OfferStatus.SoldOut } })
  })

  it('traduz erro 409 numa mensagem específica', async () => {
    vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 409 } })
    const store = buildStore()

    const action = await store.dispatch(closeOfferThunk('offer-1'))

    expect(closeOfferThunk.rejected.match(action)).toBe(true)
    if (closeOfferThunk.rejected.match(action))
      expect(action.payload).toBe('Essa offer não pode mais ser editada/encerrada.')
  })
})
