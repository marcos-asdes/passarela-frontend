/** Corpo de resposta do `GET /` do backend (rota de status/hello-world). */
export interface HealthApiInfo {
  message: string
  service: string
  timestamp: string
}

/** Estado do reducer `health`: resultado da última checagem de status da API. */
export interface HealthState {
  data: HealthApiInfo | null
  loading: boolean
  error: string | null
}
