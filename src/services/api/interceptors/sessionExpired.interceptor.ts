import type { AxiosError, AxiosInstance } from 'axios'

import { getAccessToken } from '@/services/api/authToken'
import { triggerSessionExpired } from '@/services/api/sessionExpiry'
import { API_AUTH_ROUTES } from '@/services/apiRoutes/auth'

/** Paths cujo próprio 401 é esperado (credenciais inválidas, sessão já revogada) — nunca aciona o modal global. */
const EXCLUDED_PATHS: string[] = [API_AUTH_ROUTES.post.login, API_AUTH_ROUTES.post.logout]

/**
 * Detecta 401 numa request autenticada (sessão expirada/revogada no backend) e aciona o modal global
 * de desconexão — só quando havia um accessToken em uso, senão qualquer 401 de rota pública contaria como sessão expirada.
 */
export function attachSessionExpiredInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const isUnauthorized = error.response?.status === 401
      const isExcludedPath = !!error.config?.url && EXCLUDED_PATHS.includes(error.config.url)

      if (isUnauthorized && !isExcludedPath && getAccessToken()) triggerSessionExpired()

      return Promise.reject(error)
    }
  )
}
