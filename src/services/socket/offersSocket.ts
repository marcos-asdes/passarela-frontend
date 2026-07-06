import { io, type Socket } from 'socket.io-client'

/** Conexão sob demanda com o namespace `/offers` do backend — aberta/fechada pelo `useShopperFeed`, nunca global. */
export function createOffersSocket(): Socket {
  return io(`${import.meta.env.VITE_API_URL}/offers`)
}
