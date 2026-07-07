/**
 * Testes unitários para o holder do handler de sessão expirada
 *
 * Cenários testados:
 * - triggerSessionExpired chama o handler registrado com o papel
 * - triggerSessionExpired não lança quando não há handler registrado
 * - setSessionExpiredHandler(null) remove o handler registrado
 */

import { afterEach, describe, expect, it, vi } from 'vitest'

import { setSessionExpiredHandler, triggerSessionExpired } from '@/services/api/sessionExpiry'
import { UserRole } from '@/store/reducers/auth/types'

describe('sessionExpiry', () => {
  afterEach(() => {
    setSessionExpiredHandler(null)
  })

  it('triggerSessionExpired chama o handler registrado com o papel', () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)

    triggerSessionExpired(UserRole.Merchant)

    expect(handler).toHaveBeenCalledWith(UserRole.Merchant)
  })

  it('triggerSessionExpired não lança quando não há handler registrado', () => {
    expect(() => triggerSessionExpired(UserRole.Shopper)).not.toThrow()
  })

  it('setSessionExpiredHandler(null) remove o handler registrado', () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)
    setSessionExpiredHandler(null)

    triggerSessionExpired(UserRole.Merchant)

    expect(handler).not.toHaveBeenCalled()
  })
})
