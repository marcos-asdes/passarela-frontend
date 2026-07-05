/**
 * Testes unitários para o slice health
 *
 * Cenários testados:
 * - Estado inicial
 * - `fetchHealth.pending` marca loading e limpa erro
 * - `fetchHealth.fulfilled` preenche os dados e desliga loading
 * - `fetchHealth.rejected` registra a mensagem de erro
 * - Seletores leem a branch `health` do `RootState`
 */

import { describe, expect, it } from 'vitest'

import type { RootState } from '@/store'
import healthReducer, { selectHealthData, selectHealthError, selectHealthLoading } from '@/store/reducers/health/slice'
import { fetchHealth } from '@/store/reducers/health/thunk'
import type { HealthState } from '@/store/reducers/health/types'

describe('healthSlice', () => {
  const initialState: HealthState = { data: null, loading: false, error: null }

  it('retorna o estado inicial', () => {
    expect(healthReducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  it('marca loading ao iniciar a busca', () => {
    const state = healthReducer(initialState, fetchHealth.pending('req-id', undefined))

    expect(state.loading).toBe(true)
    expect(state.error).toBeNull()
  })

  it('preenche os dados ao concluir com sucesso', () => {
    const payload = { message: 'ok', service: 'passarela-backend', timestamp: '2026-07-05T00:00:00.000Z' }

    const state = healthReducer({ ...initialState, loading: true }, fetchHealth.fulfilled(payload, 'req-id', undefined))

    expect(state.data).toEqual(payload)
    expect(state.loading).toBe(false)
  })

  it('registra o erro ao falhar', () => {
    const state = healthReducer(
      { ...initialState, loading: true },
      fetchHealth.rejected(new Error('falhou'), 'req-id', undefined, 'mensagem de erro')
    )

    expect(state.loading).toBe(false)
    expect(state.error).toBe('mensagem de erro')
  })

  it('seletores leem a branch health do RootState', () => {
    const state = { health: { data: null, loading: true, error: 'x' } } as unknown as RootState

    expect(selectHealthLoading(state)).toBe(true)
    expect(selectHealthError(state)).toBe('x')
    expect(selectHealthData(state)).toBeNull()
  })
})
