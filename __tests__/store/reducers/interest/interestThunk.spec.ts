/**
 * Testes unitários para o thunk/reducer do `interest`
 *
 * Cenários testados:
 * - registerInterestThunk: envia { offerId } pro endpoint e retorna offerId + interestId
 * - registerInterestThunk.fulfilled: adiciona o offerId em registeredOfferIds
 * - registerInterestThunk: traduz erro 409 numa mensagem específica de "já demonstrou interesse"
 */

import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { axiosApi } from '@/services/api/axiosApi'
import type { RootState } from '@/store'
import interestReducer, { selectRegisteredOfferIds } from '@/store/reducers/interest/slice'
import { registerInterestThunk } from '@/store/reducers/interest/thunk'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { post: vi.fn() }
}))

function buildStore(): ReturnType<typeof configureStore<{ interest: ReturnType<typeof interestReducer> }>> {
  return configureStore({ reducer: { interest: interestReducer } })
}

describe('interest thunk/reducer', () => {
  it('envia { offerId } pro endpoint e retorna offerId + interestId', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { id: 'interest-1' } })
    const store = buildStore()

    const action = await store.dispatch(registerInterestThunk('offer-1'))

    expect(axiosApi.post).toHaveBeenCalledWith('/interest', { offerId: 'offer-1' })
    expect(registerInterestThunk.fulfilled.match(action) && action.payload).toEqual({
      offerId: 'offer-1',
      interestId: 'interest-1'
    })
  })

  it('fulfilled adiciona o offerId em registeredOfferIds', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { id: 'interest-1' } })
    const store = buildStore()

    await store.dispatch(registerInterestThunk('offer-1'))

    expect(selectRegisteredOfferIds(store.getState() as unknown as RootState)).toEqual(['offer-1'])
  })

  it('traduz erro 409 numa mensagem específica', async () => {
    vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 409 } })
    const store = buildStore()

    const action = await store.dispatch(registerInterestThunk('offer-1'))

    expect(registerInterestThunk.rejected.match(action)).toBe(true)
    if (registerInterestThunk.rejected.match(action))
      expect(action.payload).toBe('Você já demonstrou interesse nessa offer, ou ela ficou indisponível.')
  })
})
