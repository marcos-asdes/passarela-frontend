import type { AxiosInstance } from 'axios'

import { getAccessToken } from '@/services/api/authToken'

/** Anexa `Authorization: Bearer <token>` em toda request quando há sessão ativa. */
export function attachAuthTokenInterceptor(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use((config) => {
    const accessToken = getAccessToken()
    if (accessToken) config.headers.set('Authorization', `Bearer ${accessToken}`)

    return config
  })
}
