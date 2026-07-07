/**
 * Testes unitários para attachSessionExpiredInterceptor
 *
 * Cenários testados:
 * - onFulfilled repassa a response sem alterar
 * - 401 numa rota autenticada com token ativo aciona triggerSessionExpired e rejeita o mesmo erro
 * - não aciona o handler: 401 em /auth/login, 401 em /auth/logout, 401 sem accessToken ativo, erro não-401
 */

import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { setAccessToken } from '@/services/api/authToken'
import { attachSessionExpiredInterceptor } from '@/services/api/interceptors/sessionExpired.interceptor'
import { setSessionExpiredHandler } from '@/services/api/sessionExpiry'

function buildError(status: number, url: string): AxiosError {
  return {
    response: { status } as AxiosResponse,
    config: { url }
  } as unknown as AxiosError
}

describe('attachSessionExpiredInterceptor', () => {
  let onFulfilled: (response: AxiosResponse) => AxiosResponse
  let onRejected: (error: AxiosError) => Promise<never>
  const handler = vi.fn()

  beforeEach(() => {
    handler.mockClear()
    setSessionExpiredHandler(handler)
    setAccessToken('token-123')
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

  it('401 numa rota autenticada com token ativo aciona o handler e rejeita o mesmo erro', async () => {
    const error = buildError(401, '/offers/mine')

    await expect(onRejected(error)).rejects.toBe(error)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['401 em /auth/login', 401, '/auth/login', 'token-123'],
    ['401 em /auth/logout', 401, '/auth/logout', 'token-123'],
    ['401 sem accessToken ativo', 401, '/offers/mine', null],
    ['erro não-401', 500, '/offers/mine', 'token-123']
  ])('%s não aciona o handler', async (_descricao, status, url, token) => {
    setAccessToken(token)
    const error = buildError(status, url)

    await expect(onRejected(error)).rejects.toBe(error)
    expect(handler).not.toHaveBeenCalled()
  })
})
