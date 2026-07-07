/**
 * Testes unitários para attachSessionExpiredInterceptor
 *
 * Cenários testados:
 * - onFulfilled repassa a response sem alterar
 * - 401 numa rota autenticada com token ativo aciona triggerSessionExpired com o papel da request e rejeita o mesmo erro
 * - não aciona o handler: 401 em /auth/login, 401 em /auth/logout, 401 sem accessToken ativo pro papel, 401 sem role no config, erro não-401
 */

import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAccessToken } from '@/services/api/authToken'
import { attachSessionExpiredInterceptor } from '@/services/api/interceptors/sessionExpired.interceptor'
import { setSessionExpiredHandler } from '@/services/api/sessionExpiry'
import { UserRole } from '@/store/reducers/auth/types'

function buildError(status: number, url: string, role?: UserRole): AxiosError {
  return {
    response: { status } as AxiosResponse,
    config: { url, role }
  } as unknown as AxiosError
}

describe('attachSessionExpiredInterceptor', () => {
  let onFulfilled: (response: AxiosResponse) => AxiosResponse
  let onRejected: (error: AxiosError) => Promise<never>
  const handler = vi.fn()

  beforeEach(() => {
    handler.mockClear()
    setSessionExpiredHandler(handler)
    setAccessToken(UserRole.Merchant, 'token-123')
    const use = vi.fn((fulfilled: typeof onFulfilled, rejected: typeof onRejected) => {
      onFulfilled = fulfilled
      onRejected = rejected
    })
    const axiosInstance = { interceptors: { response: { use } } } as unknown as AxiosInstance
    attachSessionExpiredInterceptor(axiosInstance)
  })

  it('onFulfilled repassa a response sem alterar', () => {
    const response = { status: 200 } as AxiosResponse

    expect(onFulfilled(response)).toBe(response)
  })

  it('401 numa rota autenticada com token ativo aciona o handler com o papel da request e rejeita o mesmo erro', async () => {
    const error = buildError(401, '/offers/mine', UserRole.Merchant)

    await expect(onRejected(error)).rejects.toBe(error)
    expect(handler).toHaveBeenCalledWith(UserRole.Merchant)
  })

  it.each([
    ['401 em /auth/login', 401, '/auth/login', UserRole.Merchant, 'token-123'],
    ['401 em /auth/logout', 401, '/auth/logout', UserRole.Merchant, 'token-123'],
    ['401 sem accessToken ativo pro papel', 401, '/offers/mine', UserRole.Merchant, null],
    ['401 sem role no config', 401, '/offers/mine', undefined, 'token-123'],
    ['erro não-401', 500, '/offers/mine', UserRole.Merchant, 'token-123']
  ])('%s não aciona o handler', async (_descricao, status, url, role, token) => {
    if (role) setAccessToken(role, token)
    const error = buildError(status, url, role)

    await expect(onRejected(error)).rejects.toBe(error)
    expect(handler).not.toHaveBeenCalled()
  })
})
