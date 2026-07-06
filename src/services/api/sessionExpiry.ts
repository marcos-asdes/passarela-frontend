/**
 * Holder do handler de sessão expirada, fora do grafo de módulos do Redux — mesmo motivo de
 * `services/api/authToken.ts`: o interceptor de resposta do `axiosApi` não pode importar `@/store`
 * (ciclo de módulos ES). `SessionExpiredWatcher` registra o handler real (modal + limpeza de estado
 * + navegação), o interceptor só aciona.
 */
let sessionExpiredHandler: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler
}

export function triggerSessionExpired(): void {
  sessionExpiredHandler?.()
}
