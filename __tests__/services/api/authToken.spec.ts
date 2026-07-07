/**
 * Testes unitários para o holder de access token
 *
 * Cenários testados:
 * - getAccessToken começa null pros dois papéis
 * - setAccessToken/getAccessToken guardam e devolvem o valor de um papel
 * - setAccessToken(role, null) limpa o valor guardado daquele papel
 * - merchant e shopper guardam tokens independentes, sem se sobrescrever
 */

import { beforeEach, describe, expect, it } from 'vitest'

import { getAccessToken, setAccessToken } from '@/services/api/authToken'
import { UserRole } from '@/store/reducers/auth/types'

describe('authToken', () => {
  beforeEach(() => {
    setAccessToken(UserRole.Merchant, null)
    setAccessToken(UserRole.Shopper, null)
  })

  it('getAccessToken começa null pros dois papéis', () => {
    expect(getAccessToken(UserRole.Merchant)).toBeNull()
    expect(getAccessToken(UserRole.Shopper)).toBeNull()
  })

  it('setAccessToken/getAccessToken guardam e devolvem o valor de um papel', () => {
    setAccessToken(UserRole.Merchant, 'token-123')

    expect(getAccessToken(UserRole.Merchant)).toBe('token-123')
  })

  it('setAccessToken(role, null) limpa o valor guardado daquele papel', () => {
    setAccessToken(UserRole.Merchant, 'token-123')
    setAccessToken(UserRole.Merchant, null)

    expect(getAccessToken(UserRole.Merchant)).toBeNull()
  })

  it('merchant e shopper guardam tokens independentes, sem se sobrescrever', () => {
    setAccessToken(UserRole.Merchant, 'token-merchant')
    setAccessToken(UserRole.Shopper, 'token-shopper')

    expect(getAccessToken(UserRole.Merchant)).toBe('token-merchant')
    expect(getAccessToken(UserRole.Shopper)).toBe('token-shopper')
  })
})
