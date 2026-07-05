/**
 * Testes unitários para counterSlice
 *
 * Cenários testados:
 * - Estado inicial
 * - `incremented` soma 1
 * - `decremented` subtrai 1
 * - `addedByAmount` soma o valor informado
 */

import { describe, expect, it } from 'vitest'

import counterReducer, { addedByAmount, decremented, incremented } from '@/store/reducers/counter'

describe('counterSlice', () => {
  it('retorna o estado inicial', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual({ value: 0 })
  })

  it('incrementa o valor em 1', () => {
    expect(counterReducer({ value: 0 }, incremented())).toEqual({ value: 1 })
  })

  it('decrementa o valor em 1', () => {
    expect(counterReducer({ value: 0 }, decremented())).toEqual({ value: -1 })
  })

  it('soma o valor informado', () => {
    expect(counterReducer({ value: 2 }, addedByAmount(5))).toEqual({ value: 7 })
  })
})
