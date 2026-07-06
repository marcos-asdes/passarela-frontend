/**
 * Testes unitários para createThunk
 *
 * Cenários testados:
 * - Despacha `fulfilled` com o retorno da função
 * - Despacha `rejected` com `error.message` quando a função lança um `Error`
 * - Usa mensagem padrão quando o erro lançado não é um `Error` com mensagem
 */

import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import { createThunk } from '@/utils/redux/createThunk'

const reducer = (state: Record<string, never> = {}): Record<string, never> => state

/**
 * Tipo de retorno via `ReturnType<typeof configureStore<...>>` (não `EnhancedStore<S>` de mão) —
 * preserva o `ThunkDispatch` que o `configureStore` já inclui por padrão nos middlewares.
 */
function buildStore(): ReturnType<typeof configureStore<Record<string, never>>> {
  return configureStore({ reducer })
}

describe('createThunk', () => {
  it('despacha fulfilled com o retorno da função', async () => {
    const thunk = createThunk<string>('test/ok', async () => 'valor')
    const store = buildStore()

    const action = await store.dispatch(thunk())

    expect(action.type).toBe('test/ok/fulfilled')
    expect(action.payload).toBe('valor')
  })

  it('despacha rejected com error.message quando a função lança Error', async () => {
    const thunk = createThunk<string>('test/fail', async () => {
      throw new Error('deu ruim')
    })
    const store = buildStore()

    const action = await store.dispatch(thunk())

    expect(action.type).toBe('test/fail/rejected')
    expect(action.payload).toBe('deu ruim')
  })

  it('usa mensagem padrão quando o erro não é um Error com mensagem', async () => {
    const thunk = createThunk<string>('test/fail-generic', async () => {
      throw 'string qualquer'
    })
    const store = buildStore()

    const action = await store.dispatch(thunk())

    expect(action.payload).toBe('Ocorreu um erro inesperado')
  })
})
