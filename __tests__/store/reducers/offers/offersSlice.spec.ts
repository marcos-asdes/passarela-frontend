/**
 * Testes unitários para o reducer `offers` (slice)
 *
 * Cenários testados:
 * - offerReceived: adiciona a offer no topo de `public.items`
 * - offerReceived: ignora quando a offer já está na lista (evita duplicata em corrida com o refetch)
 * - offerStatusChanged: atualiza só o status da offer correspondente em `public.items` (Expired/SoldOut)
 * - offerStatusChanged: remove a offer de `public.items` quando o status é Closed
 * - offerStatusChanged: não faz nada quando a offer não está na lista
 * - fetchMyOffersThunk: pending/fulfilled/rejected atualizam loading/error/items de `mine`
 * - createOfferThunk: pending/rejected atualizam loading/error de `create`
 * - createOfferThunk.fulfilled: adiciona a offer criada em `mine.items` com interestCount 0
 * - closeOfferThunk: pending/rejected atualizam loading/error de `close`
 * - closeOfferThunk.fulfilled: atualiza só o status da offer correspondente em `mine.items`
 * - fetchPublicOffersThunk: pending/fulfilled/rejected atualizam loading/error/items de `public`
 * - registerInterestThunk.fulfilled: decrementa o estoque da offer em public.items, vira SoldOut ao zerar
 * - removeInterestThunk.fulfilled: devolve 1 unidade ao estoque, reativa a offer se estava SoldOut
 */

import { describe, expect, it } from 'vitest'

import { registerInterestThunk, removeInterestThunk } from '@/store/reducers/interest/thunk'
import {
  closeOfferThunk,
  createOfferThunk,
  fetchMyOffersThunk,
  fetchPublicOffersThunk
} from '@/store/reducers/offers/thunk'
import { OfferStatus } from '@/store/reducers/offers/types'
import reducer, { initialState, offerReceived, offerStatusChanged } from '@/store/reducers/offers/slice'

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

describe('offers slice', () => {
  it('offerReceived adiciona a offer no topo de public.items', () => {
    const state = reducer(initialState, offerReceived(offer))

    expect(state.public.items).toEqual([offer])
  })

  it('offerReceived ignora quando a offer já está na lista', () => {
    const withOffer = reducer(initialState, offerReceived(offer))

    const state = reducer(withOffer, offerReceived(offer))

    expect(state.public.items).toHaveLength(1)
  })

  it('offerStatusChanged atualiza só o status da offer correspondente em public.items', () => {
    const withOffer = reducer(initialState, offerReceived(offer))

    const state = reducer(withOffer, offerStatusChanged({ ...offer, status: OfferStatus.Expired }))

    expect(state.public.items[0].status).toBe(OfferStatus.Expired)
    expect(state.public.items[0].title).toBe(offer.title)
  })

  it('offerStatusChanged remove a offer de public.items quando o status é Closed', () => {
    const withOffer = reducer(initialState, offerReceived(offer))

    const state = reducer(withOffer, offerStatusChanged({ ...offer, status: OfferStatus.Closed }))

    expect(state.public.items).toHaveLength(0)
  })

  it('offerStatusChanged não faz nada quando a offer não está na lista', () => {
    const state = reducer(initialState, offerStatusChanged({ ...offer, status: OfferStatus.Expired }))

    expect(state.public.items).toHaveLength(0)
  })

  describe('fetchMyOffersThunk', () => {
    it('pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, mine: { ...initialState.mine, error: 'erro antigo' } }

      const state = reducer(seeded, { type: fetchMyOffersThunk.pending.type })

      expect(state.mine.loading).toBe(true)
      expect(state.mine.error).toBeNull()
    })

    it('fulfilled guarda os items devolvidos', () => {
      const payload = [{ ...offer, interestCount: 1 }]

      const state = reducer(initialState, { type: fetchMyOffersThunk.fulfilled.type, payload })

      expect(state.mine.loading).toBe(false)
      expect(state.mine.items).toEqual(payload)
    })

    it('rejected guarda a mensagem de erro', () => {
      const action = { type: fetchMyOffersThunk.rejected.type, payload: 'falha ao buscar' }

      const state = reducer(initialState, action)

      expect(state.mine.loading).toBe(false)
      expect(state.mine.error).toBe('falha ao buscar')
    })
  })

  describe('createOfferThunk', () => {
    it('pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, create: { ...initialState.create, error: 'erro antigo' } }

      const state = reducer(seeded, { type: createOfferThunk.pending.type })

      expect(state.create.loading).toBe(true)
      expect(state.create.error).toBeNull()
    })

    it('fulfilled adiciona a offer criada em mine.items com interestCount 0', () => {
      const action = { type: createOfferThunk.fulfilled.type, payload: offer }

      const state = reducer(initialState, action)

      expect(state.mine.items).toEqual([{ ...offer, interestCount: 0 }])
    })

    it('rejected guarda a mensagem de erro', () => {
      const action = { type: createOfferThunk.rejected.type, payload: 'falha ao criar' }

      const state = reducer(initialState, action)

      expect(state.create.loading).toBe(false)
      expect(state.create.error).toBe('falha ao criar')
    })
  })

  describe('closeOfferThunk', () => {
    it('pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, close: { ...initialState.close, error: 'erro antigo' } }

      const state = reducer(seeded, { type: closeOfferThunk.pending.type })

      expect(state.close.loading).toBe(true)
      expect(state.close.error).toBeNull()
    })

    it('fulfilled atualiza só o status da offer correspondente', () => {
      const seeded = { ...initialState, mine: { ...initialState.mine, items: [{ ...offer, interestCount: 3 }] } }
      const action = { type: closeOfferThunk.fulfilled.type, payload: { ...offer, status: OfferStatus.Closed } }

      const state = reducer(seeded, action)

      expect(state.mine.items[0].status).toBe(OfferStatus.Closed)
      expect(state.mine.items[0].interestCount).toBe(3)
    })

    it('rejected guarda a mensagem de erro', () => {
      const action = { type: closeOfferThunk.rejected.type, payload: 'falha ao encerrar' }

      const state = reducer(initialState, action)

      expect(state.close.loading).toBe(false)
      expect(state.close.error).toBe('falha ao encerrar')
    })
  })

  describe('fetchPublicOffersThunk', () => {
    it('pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, public: { ...initialState.public, error: 'erro antigo' } }

      const state = reducer(seeded, { type: fetchPublicOffersThunk.pending.type })

      expect(state.public.loading).toBe(true)
      expect(state.public.error).toBeNull()
    })

    it('fulfilled guarda os items devolvidos', () => {
      const state = reducer(initialState, { type: fetchPublicOffersThunk.fulfilled.type, payload: [offer] })

      expect(state.public.loading).toBe(false)
      expect(state.public.items).toEqual([offer])
    })

    it('rejected guarda a mensagem de erro', () => {
      const action = { type: fetchPublicOffersThunk.rejected.type, payload: 'falha ao buscar feed' }

      const state = reducer(initialState, action)

      expect(state.public.loading).toBe(false)
      expect(state.public.error).toBe('falha ao buscar feed')
    })
  })

  describe('reação a registerInterestThunk/removeInterestThunk', () => {
    it('registerInterestThunk.fulfilled decrementa o estoque da offer em public.items', () => {
      const withOffer = reducer(initialState, offerReceived(offer))
      const action = { type: registerInterestThunk.fulfilled.type, payload: { offerId: 'offer-1', interestId: 'i-1' } }

      const state = reducer(withOffer, action)

      expect(state.public.items[0].stock).toBe(9)
      expect(state.public.items[0].status).toBe(OfferStatus.Active)
    })

    it('registerInterestThunk.fulfilled vira SoldOut quando o estoque zera', () => {
      const withOffer = reducer(initialState, offerReceived({ ...offer, stock: 1 }))
      const action = { type: registerInterestThunk.fulfilled.type, payload: { offerId: 'offer-1', interestId: 'i-1' } }

      const state = reducer(withOffer, action)

      expect(state.public.items[0].stock).toBe(0)
      expect(state.public.items[0].status).toBe(OfferStatus.SoldOut)
    })

    it('removeInterestThunk.fulfilled devolve 1 unidade ao estoque e reativa se estava SoldOut', () => {
      const withOffer = reducer(initialState, offerReceived({ ...offer, stock: 0, status: OfferStatus.SoldOut }))
      const action = { type: removeInterestThunk.fulfilled.type, payload: 'offer-1' }

      const state = reducer(withOffer, action)

      expect(state.public.items[0].stock).toBe(1)
      expect(state.public.items[0].status).toBe(OfferStatus.Active)
    })
  })
})
