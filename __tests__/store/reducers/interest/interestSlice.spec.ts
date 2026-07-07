/**
 * Testes unitários para o reducer `interest` (slice)
 *
 * Cenários testados:
 * - fetchMyInterestsThunk.pending marca loading e limpa erro
 * - fetchMyInterestsThunk.fulfilled reconstrói o mapa registeredInterests
 * - fetchMyInterestsThunk.rejected desmarca loading
 * - registerInterestThunk.pending empilha o offerId em pendingOfferIds
 * - registerInterestThunk.fulfilled remove de pendingOfferIds e adiciona em registeredInterests
 * - registerInterestThunk.rejected remove de pendingOfferIds e guarda o erro
 * - removeInterestThunk.pending empilha o offerId em pendingOfferIds
 * - removeInterestThunk.fulfilled remove de pendingOfferIds e de registeredInterests
 * - removeInterestThunk.rejected remove de pendingOfferIds e guarda o erro
 */

import { describe, expect, it } from 'vitest'

import { fetchMyInterestsThunk, registerInterestThunk, removeInterestThunk } from '@/store/reducers/interest/thunk'
import reducer, { initialState } from '@/store/reducers/interest/slice'

describe('interest slice', () => {
  describe('fetchMyInterestsThunk', () => {
    it('pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, error: 'erro antigo' }

      const state = reducer(seeded, { type: fetchMyInterestsThunk.pending.type })

      expect(state.fetchLoading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('fulfilled reconstrói o mapa registeredInterests', () => {
      const payload = [
        { id: 'interest-1', offerId: 'offer-1' },
        { id: 'interest-2', offerId: 'offer-2' }
      ]

      const state = reducer(initialState, { type: fetchMyInterestsThunk.fulfilled.type, payload })

      expect(state.fetchLoading).toBe(false)
      expect(state.registeredInterests).toEqual({ 'offer-1': 'interest-1', 'offer-2': 'interest-2' })
    })

    it('rejected desmarca loading', () => {
      const seeded = { ...initialState, fetchLoading: true }

      const state = reducer(seeded, { type: fetchMyInterestsThunk.rejected.type })

      expect(state.fetchLoading).toBe(false)
    })
  })

  describe('registerInterestThunk', () => {
    it('pending empilha o offerId em pendingOfferIds', () => {
      const action = { type: registerInterestThunk.pending.type, meta: { arg: 'offer-1' } }

      const state = reducer(initialState, action)

      expect(state.pendingOfferIds).toEqual(['offer-1'])
    })

    it('fulfilled remove de pendingOfferIds e adiciona em registeredInterests', () => {
      const seeded = { ...initialState, pendingOfferIds: ['offer-1'] }
      const action = {
        type: registerInterestThunk.fulfilled.type,
        payload: { offerId: 'offer-1', interestId: 'interest-1' }
      }

      const state = reducer(seeded, action)

      expect(state.pendingOfferIds).toEqual([])
      expect(state.registeredInterests).toEqual({ 'offer-1': 'interest-1' })
    })

    it('rejected remove de pendingOfferIds e guarda o erro', () => {
      const seeded = { ...initialState, pendingOfferIds: ['offer-1'] }
      const action = { type: registerInterestThunk.rejected.type, meta: { arg: 'offer-1' }, payload: 'já registrado' }

      const state = reducer(seeded, action)

      expect(state.pendingOfferIds).toEqual([])
      expect(state.error).toBe('já registrado')
    })
  })

  describe('removeInterestThunk', () => {
    it('pending empilha o offerId em pendingOfferIds', () => {
      const action = { type: removeInterestThunk.pending.type, meta: { arg: 'offer-1' } }

      const state = reducer(initialState, action)

      expect(state.pendingOfferIds).toEqual(['offer-1'])
    })

    it('fulfilled remove de pendingOfferIds e de registeredInterests', () => {
      const seeded = {
        ...initialState,
        pendingOfferIds: ['offer-1'],
        registeredInterests: { 'offer-1': 'interest-1' }
      }
      const action = { type: removeInterestThunk.fulfilled.type, payload: 'offer-1' }

      const state = reducer(seeded, action)

      expect(state.pendingOfferIds).toEqual([])
      expect(state.registeredInterests).toEqual({})
    })

    it('rejected remove de pendingOfferIds e guarda o erro', () => {
      const seeded = { ...initialState, pendingOfferIds: ['offer-1'] }
      const action = { type: removeInterestThunk.rejected.type, meta: { arg: 'offer-1' }, payload: 'não encontrado' }

      const state = reducer(seeded, action)

      expect(state.pendingOfferIds).toEqual([])
      expect(state.error).toBe('não encontrado')
    })
  })
})
