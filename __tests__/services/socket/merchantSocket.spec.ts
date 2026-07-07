/**
 * Testes unitários para createMerchantSocket
 *
 * Cenários testados:
 * - conecta no namespace /offers
 * - emite merchant:subscribe com o merchantId ao conectar
 */

import { io } from 'socket.io-client'
import { describe, expect, it, vi } from 'vitest'

import { createMerchantSocket } from '@/services/socket/merchantSocket'

vi.mock('socket.io-client', () => ({
  io: vi.fn()
}))

describe('createMerchantSocket', () => {
  it('conecta no namespace /offers', () => {
    const socket = { on: vi.fn(), emit: vi.fn() }
    vi.mocked(io).mockReturnValue(socket as never)

    createMerchantSocket('merchant-1')

    expect(io).toHaveBeenCalledWith(`${import.meta.env.VITE_API_URL}/offers`)
  })

  it('emite merchant:subscribe com o merchantId ao conectar', () => {
    const socket = { on: vi.fn(), emit: vi.fn() }
    vi.mocked(io).mockReturnValue(socket as never)

    createMerchantSocket('merchant-1')
    const connectHandler = socket.on.mock.calls.find(([event]) => event === 'connect')?.[1] as () => void
    connectHandler()

    expect(socket.emit).toHaveBeenCalledWith('merchant:subscribe', { merchantId: 'merchant-1' })
  })
})
