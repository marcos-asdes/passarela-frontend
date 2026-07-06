import axios from 'axios'

import { attachAuthTokenInterceptor } from '@/services/api/interceptors/authToken.interceptor'

/** Instância única do axios, usada pelos thunks. */
export const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

attachAuthTokenInterceptor(axiosApi)
