/**
 * Testes unitários para o holder do handler de sessão expirada
 *
 * Cenários testados:
 * - triggerSessionExpired chama o handler registrado
 * - triggerSessionExpired não lança quando não há handler registrado
 * - setSessionExpiredHandler(null) remove o handler registrado
 */

import { afterEach, describe, expect, it, vi } from 'vitest'

import { setSessionExpiredHandler, triggerSessionExpired } from '@/services/api/sessionExpiry'

describe('sessionExpiry', () => {
  afterEach(() => {
    setSessionExpiredHandler(null)
  })

  it('triggerSessionExpired chama o handler registrado', () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)

    triggerSessionExpired()

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('triggerSessionExpired não lança quando não há handler registrado', () => {
    expect(() => triggerSessionExpired()).not.toThrow()
  })

  it('setSessionExpiredHandler(null) remove o handler registrado', () => {
    const handler = vi.fn()
    setSessionExpiredHandler(handler)
    setSessionExpiredHandler(null)

    triggerSessionExpired()

    expect(handler).not.toHaveBeenCalled()
  })
})
