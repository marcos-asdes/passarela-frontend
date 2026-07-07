/**
 * Testes unitários para o thunk/reducer do `interest`
 *
 * Cenários testados:
 * - registerInterestThunk: envia { offerId } pro endpoint e retorna offerId + interestId
 * - registerInterestThunk.fulfilled: adiciona o offerId em registeredInterests
 * - registerInterestThunk: traduz erro 409 numa mensagem específica de "já demonstrou interesse"
 * - registerInterestThunk: erro não-409 cai na mensagem genérica
 * - fetchMyInterestsThunk: busca os interests do shopper autenticado
 * - fetchMyInterestsThunk: erro cai na mensagem genérica
 * - removeInterestThunk: remove o interest e retorna o offerId
 * - removeInterestThunk: traduz erro 404 em "Interesse não encontrado"
 * - removeInterestThunk: erro não-404 cai na mensagem genérica
 */

import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { axiosApi } from '@/services/api/axiosApi'
import type { RootState } from '@/store'
import interestReducer, { selectRegisteredInterests } from '@/store/reducers/interest/slice'
import { fetchMyInterestsThunk, registerInterestThunk, removeInterestThunk } from '@/store/reducers/interest/thunk'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn(), delete: vi.fn() }
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

  it('fulfilled adiciona o offerId em registeredInterests', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { id: 'interest-1' } })
    const store = buildStore()

    await store.dispatch(registerInterestThunk('offer-1'))

    expect(selectRegisteredInterests(store.getState() as unknown as RootState)).toEqual({ 'offer-1': 'interest-1' })
  })

  it('traduz erro 409 numa mensagem específica', async () => {
    vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 409 } })
    const store = buildStore()

    const action = await store.dispatch(registerInterestThunk('offer-1'))

    expect(registerInterestThunk.rejected.match(action)).toBe(true)
    if (registerInterestThunk.rejected.match(action))
      expect(action.payload).toBe('Você já demonstrou interesse nessa oferta, ou ela ficou indisponível.')
  })

  it('registerInterestThunk: erro não-409 cai na mensagem genérica', async () => {
    vi.mocked(axiosApi.post).mockRejectedValue(new Error('falha de rede'))
    const store = buildStore()

    const action = await store.dispatch(registerInterestThunk('offer-1'))

    expect(registerInterestThunk.rejected.match(action)).toBe(true)
    if (registerInterestThunk.rejected.match(action)) expect(action.payload).toBe('Algo deu errado. Tente novamente.')
  })

  it('fetchMyInterestsThunk busca os interests do shopper autenticado', async () => {
    vi.mocked(axiosApi.get).mockResolvedValue({ data: [{ id: 'interest-1', offerId: 'offer-1' }] })
    const store = buildStore()

    const action = await store.dispatch(fetchMyInterestsThunk())

    expect(axiosApi.get).toHaveBeenCalledWith('/interest/mine')
    expect(fetchMyInterestsThunk.fulfilled.match(action) && action.payload).toEqual([
      { id: 'interest-1', offerId: 'offer-1' }
    ])
  })

  it('fetchMyInterestsThunk: erro cai na mensagem genérica', async () => {
    vi.mocked(axiosApi.get).mockRejectedValue(new Error('falha de rede'))
    const store = buildStore()

    const action = await store.dispatch(fetchMyInterestsThunk())

    expect(fetchMyInterestsThunk.rejected.match(action)).toBe(true)
    if (fetchMyInterestsThunk.rejected.match(action)) expect(action.payload).toBe('Algo deu errado. Tente novamente.')
  })

  it('removeInterestThunk remove o interest e retorna o offerId', async () => {
    vi.mocked(axiosApi.delete).mockResolvedValue({ data: undefined })
    const store = buildStore()

    const action = await store.dispatch(removeInterestThunk('offer-1'))

    expect(axiosApi.delete).toHaveBeenCalledWith('/interest/offer-1')
    expect(removeInterestThunk.fulfilled.match(action) && action.payload).toBe('offer-1')
  })

  it('removeInterestThunk traduz erro 404 em "Interesse não encontrado"', async () => {
    vi.mocked(axiosApi.delete).mockRejectedValue({ isAxiosError: true, response: { status: 404 } })
    const store = buildStore()

    const action = await store.dispatch(removeInterestThunk('offer-1'))

    expect(removeInterestThunk.rejected.match(action)).toBe(true)
    if (removeInterestThunk.rejected.match(action)) expect(action.payload).toBe('Interesse não encontrado.')
  })

  it('removeInterestThunk: erro não-404 cai na mensagem genérica', async () => {
    vi.mocked(axiosApi.delete).mockRejectedValue({ isAxiosError: true, response: { status: 500 } })
    const store = buildStore()

    const action = await store.dispatch(removeInterestThunk('offer-1'))

    expect(removeInterestThunk.rejected.match(action)).toBe(true)
    if (removeInterestThunk.rejected.match(action)) expect(action.payload).toBe('Algo deu errado. Tente novamente.')
  })
})
