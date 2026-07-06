import { io, type Socket } from 'socket.io-client'

/**
 * Conexão sob demanda com o namespace `/offers` pro papel merchant — aberta/fechada pelo
 * `useMerchantDashboard`, nunca global. Emite `merchant:subscribe` no connect pra entrar na sala
 * das próprias offers (handshake sem autenticação, mesmo trade-off do `createOffersSocket`).
 */
export function createMerchantSocket(merchantId: string): Socket {
  const socket = io(`${import.meta.env.VITE_API_URL}/offers`)
  socket.on('connect', () => {
    socket.emit('merchant:subscribe', { merchantId })
  })
  return socket
}
