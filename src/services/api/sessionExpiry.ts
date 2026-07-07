import type { UserRole } from '@/store/reducers/auth/types'

/**
 * Holder do handler de sessão expirada, fora do grafo de módulos do Redux — mesmo motivo de
 * `services/api/authToken.ts`: o interceptor de resposta do `axiosApi` não pode importar `@/store`
 * (ciclo de módulos ES). `SessionExpiredWatcher` registra o handler real (modal + limpeza de estado
 * + navegação), o interceptor só aciona. Recebe o papel cuja sessão expirou, pra derrubar só aquela.
 */
let sessionExpiredHandler: ((role: UserRole) => void) | null = null

export function setSessionExpiredHandler(handler: ((role: UserRole) => void) | null): void {
  sessionExpiredHandler = handler
}

export function triggerSessionExpired(role: UserRole): void {
  sessionExpiredHandler?.(role)
}
