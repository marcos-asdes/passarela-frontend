import type { AxiosInstance } from 'axios'

import { getAccessToken } from '@/services/api/authToken'
import '@/services/api/types'

/** Anexa `Authorization: Bearer <token>` do papel indicado em `config.role`, quando há sessão ativa. */
export function attachAuthTokenInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use((config) => {
    if (config.role) {
      const accessToken = getAccessToken(config.role)
      if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`)
    }

    return config
  })
}
