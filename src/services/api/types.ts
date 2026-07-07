import type { UserRole } from '@/store/reducers/auth/types'

/**
 * Module augmentation do Axios: carrega qual papel uma request autenticada pertence, pra o
 * interceptor de Authorization saber qual dos dois tokens (merchant/shopper) anexar. Ausente em
 * chamadas públicas (register, login, feed público) — nenhum header é anexado nesse caso.
 */
declare module 'axios' {
  interface AxiosRequestConfig {
    role?: UserRole
  }
}
