/**
 * Testes unitários para attachAuthTokenInterceptor
 *
 * Cenários testados:
 * - anexa Authorization: Bearer <token> quando há accessToken
 * - não anexa Authorization quando não há accessToken
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAccessToken } from '@/services/api/authToken'
import { attachAuthTokenInterceptor } from '@/services/api/interceptors/authToken.interceptor'

describe('attachAuthTokenInterceptor', () => {
  let requestHandler: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig

  beforeEach(() => {
    setAccessToken(null)
    const use = vi.fn((handler: typeof requestHandler) => {
      requestHandler = handler
    })
    const axiosInstance = { interceptors: { request: { use } } } as unknown as AxiosInstance
    attachAuthTokenInterceptor(axiosInstance)
  })

  it('anexa Authorization: Bearer <token> quando há accessToken', () => {
    setAccessToken('token-123')
    const set = vi.fn()
    const config = { headers: { set } } as unknown as InternalAxiosRequestConfig

    const result = requestHandler(config)

    expect(set).toHaveBeenCalledWith('Authorization', 'Bearer token-123')
    expect(result).toBe(config)
  })

  it('não anexa Authorization quando não há accessToken', () => {
    const set = vi.fn()
    const config = { headers: { set } } as unknown as InternalAxiosRequestConfig

    requestHandler(config)

    expect(set).not.toHaveBeenCalled()
  })
})
