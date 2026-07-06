/**
 * Testes unitários para o reducer `offers` (slice)
 *
 * Cenários testados:
 * - offerReceived: adiciona a offer no topo de `public.items`
 * - offerReceived: ignora quando a offer já está na lista (evita duplicata em corrida com o refetch)
 * - createOfferThunk.fulfilled: adiciona a offer criada em `mine.items` com interestCount 0
 * - closeOfferThunk.fulfilled: atualiza só o status da offer correspondente em `mine.items`
 */

import { describe, expect, it } from 'vitest'

import { closeOfferThunk, createOfferThunk } from '@/store/reducers/offers/thunk'
import { OfferStatus } from '@/store/reducers/offers/types'
import reducer, { initialState, offerReceived } from '@/store/reducers/offers/slice'

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

  it('createOfferThunk.fulfilled adiciona a offer criada em mine.items com interestCount 0', () => {
    const action = { type: createOfferThunk.fulfilled.type, payload: offer }

    const state = reducer(initialState, action)

    expect(state.mine.items).toEqual([{ ...offer, interestCount: 0 }])
  })

  it('closeOfferThunk.fulfilled atualiza só o status da offer correspondente', () => {
    const seeded = { ...initialState, mine: { ...initialState.mine, items: [{ ...offer, interestCount: 3 }] } }
    const action = { type: closeOfferThunk.fulfilled.type, payload: { ...offer, status: OfferStatus.Closed } }

    const state = reducer(seeded, action)

    expect(state.mine.items[0].status).toBe(OfferStatus.Closed)
    expect(state.mine.items[0].interestCount).toBe(3)
  })
})
