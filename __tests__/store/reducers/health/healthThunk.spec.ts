/**
 * Testes unitários para o thunk fetchHealth
 *
 * Cenários testados:
 * - Busca o status da API via `axiosApi.get` e popula o state ao concluir
 * - Registra a mensagem de erro no state quando a chamada falha
 */

import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { axiosApi } from '@/services/api/axiosApi'
import healthReducer from '@/store/reducers/health/slice'
import { fetchHealth } from '@/store/reducers/health/thunk'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn() }
}))

describe('fetchHealth', () => {
  it('busca o status da API e popula o state ao concluir', async () => {
    const response = {
      message: 'Servidor Passarela em execução',
      service: 'passarela-backend',
      timestamp: '2026-07-05T00:00:00.000Z'
    }
    vi.mocked(axiosApi.get).mockResolvedValueOnce({ data: response })

    const store = configureStore({ reducer: { health: healthReducer } })
    await store.dispatch(fetchHealth())

    expect(axiosApi.get).toHaveBeenCalledWith('/')
    expect(store.getState().health.data).toEqual(response)
  })

  it('registra o erro no state quando a chamada falha', async () => {
    vi.mocked(axiosApi.get).mockRejectedValueOnce(new Error('falha de rede'))

    const store = configureStore({ reducer: { health: healthReducer } })
    await store.dispatch(fetchHealth())

    expect(store.getState().health.error).toBe('falha de rede')
  })
})
