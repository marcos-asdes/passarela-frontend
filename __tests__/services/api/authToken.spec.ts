/**
 * Testes unitários para o holder de access token
 *
 * Cenários testados:
 * - getAccessToken começa null
 * - setAccessToken/getAccessToken guardam e devolvem o valor
 * - setAccessToken(null) limpa o valor guardado
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { getAccessToken, setAccessToken } from '@/services/api/authToken'

describe('authToken', () => {
  beforeEach(() => {
    setAccessToken(null)
  })

  it('getAccessToken começa null', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('setAccessToken/getAccessToken guardam e devolvem o valor', () => {
    setAccessToken('token-123')

    expect(getAccessToken()).toBe('token-123')
  })

  it('setAccessToken(null) limpa o valor guardado', () => {
    setAccessToken('token-123')
    setAccessToken(null)

    expect(getAccessToken()).toBeNull()
  })
})
