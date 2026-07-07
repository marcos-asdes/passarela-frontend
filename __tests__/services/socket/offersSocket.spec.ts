/**
 * Testes unitários para createOffersSocket
 *
 * Cenários testados:
 * - conecta no namespace /offers
 */

import { io } from 'socket.io-client'
import { describe, expect, it, vi } from 'vitest'

import { createOffersSocket } from '@/services/socket/offersSocket'

vi.mock('socket.io-client', () => ({
  io: vi.fn()
}))

describe('createOffersSocket', () => {
  it('conecta no namespace /offers', () => {
    createOffersSocket()

    expect(io).toHaveBeenCalledWith(`${import.meta.env.VITE_API_URL}/offers`)
  })
})
