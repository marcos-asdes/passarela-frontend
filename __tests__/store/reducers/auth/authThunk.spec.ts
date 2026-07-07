/**
 * Testes unitários para os thunks do reducer `auth`
 *
 * Cenários testados:
 * - registerThunk: envia o payload pro endpoint de registro e retorna a mensagem de confirmação
 * - registerThunk: traduz 409 em "e-mail ou CPF já cadastrado"
 * - registerThunk: traduz 429 em "muitas tentativas"
 * - registerThunk: erro não-axios cai na mensagem genérica
 * - loginThunk: envia o payload pro endpoint de login e retorna accessToken + user
 * - loginThunk: traduz 401 em "e-mail ou senha inválidos"
 * - loginThunk: traduz 429 em "muitas tentativas"
 * - fetchProfileThunk: busca o perfil autenticado
 * - logoutThunk: chama o endpoint de logout
 */

import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it, vi } from 'vitest'

import { axiosApi } from '@/services/api/axiosApi'
import authReducer from '@/store/reducers/auth'
import { fetchProfileThunk, loginThunk, logoutThunk, registerThunk } from '@/store/reducers/auth/thunk'
import { UserRole } from '@/store/reducers/auth/types'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn(), post: vi.fn() }
}))

function buildStore(): ReturnType<typeof configureStore<{ auth: ReturnType<typeof authReducer> }>> {
  return configureStore({ reducer: { auth: authReducer } })
}

const registerPayload = {
  name: 'Maria da Silva',
  email: 'maria@teste.com',
  cpf: '52998224725',
  phone: '11987654321',
  birthDate: new Date('1990-01-01'),
  password: 'SenhaForte123!',
  confirmPassword: 'SenhaForte123!',
  role: UserRole.Shopper
}

describe('auth thunks', () => {
  describe('registerThunk', () => {
    it('envia o payload pro endpoint de registro e retorna a mensagem de confirmação', async () => {
      vi.mocked(axiosApi.post).mockResolvedValue({ data: { message: 'Conta criada com sucesso.' } })
      const store = buildStore()

      const action = await store.dispatch(registerThunk(registerPayload))

      expect(axiosApi.post).toHaveBeenCalledWith('/auth/register', registerPayload)
      expect(registerThunk.fulfilled.match(action) && action.payload).toEqual({
        message: 'Conta criada com sucesso.'
      })
    })

    it('traduz 409 em "e-mail ou CPF já cadastrado"', async () => {
      vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 409 } })
      const store = buildStore()

      const action = await store.dispatch(registerThunk(registerPayload))

      expect(registerThunk.rejected.match(action)).toBe(true)
      if (registerThunk.rejected.match(action)) expect(action.payload).toBe('Este e-mail ou CPF já está cadastrado.')
    })

    it('traduz 429 em "muitas tentativas"', async () => {
      vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 429 } })
      const store = buildStore()

      const action = await store.dispatch(registerThunk(registerPayload))

      expect(registerThunk.rejected.match(action)).toBe(true)
      if (registerThunk.rejected.match(action))
        expect(action.payload).toBe('Muitas tentativas. Aguarde um minuto e tente novamente.')
    })

    it('erro não-axios cai na mensagem genérica', async () => {
      vi.mocked(axiosApi.post).mockRejectedValue(new Error('falha de rede'))
      const store = buildStore()

      const action = await store.dispatch(registerThunk(registerPayload))

      expect(registerThunk.rejected.match(action)).toBe(true)
      if (registerThunk.rejected.match(action)) expect(action.payload).toBe('Algo deu errado. Tente novamente.')
    })
  })

  describe('loginThunk', () => {
    const loginPayload = { email: 'maria@teste.com', password: 'SenhaForte123!' }

    it('envia o payload pro endpoint de login e retorna accessToken + user', async () => {
      const data = { accessToken: 'token-123', user: { id: 'user-1', role: UserRole.Shopper } }
      vi.mocked(axiosApi.post).mockResolvedValue({ data })
      const store = buildStore()

      const action = await store.dispatch(loginThunk(loginPayload))

      expect(axiosApi.post).toHaveBeenCalledWith('/auth/login', loginPayload)
      expect(loginThunk.fulfilled.match(action) && action.payload).toEqual(data)
    })

    it('traduz 401 em "e-mail ou senha inválidos"', async () => {
      vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 401 } })
      const store = buildStore()

      const action = await store.dispatch(loginThunk(loginPayload))

      expect(loginThunk.rejected.match(action)).toBe(true)
      if (loginThunk.rejected.match(action)) expect(action.payload).toBe('E-mail ou senha inválidos.')
    })

    it('traduz 429 em "muitas tentativas"', async () => {
      vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 429 } })
      const store = buildStore()

      const action = await store.dispatch(loginThunk(loginPayload))

      expect(loginThunk.rejected.match(action)).toBe(true)
      if (loginThunk.rejected.match(action))
        expect(action.payload).toBe('Muitas tentativas. Aguarde um minuto e tente novamente.')
    })
  })

  describe('fetchProfileThunk', () => {
    it('busca o perfil autenticado', async () => {
      vi.mocked(axiosApi.get).mockResolvedValue({ data: { name: 'Maria', email: 'maria@teste.com' } })
      const store = buildStore()

      const action = await store.dispatch(fetchProfileThunk())

      expect(axiosApi.get).toHaveBeenCalledWith('/auth/me')
      expect(fetchProfileThunk.fulfilled.match(action) && action.payload).toEqual({
        name: 'Maria',
        email: 'maria@teste.com'
      })
    })
  })

  describe('logoutThunk', () => {
    it('chama o endpoint de logout', async () => {
      vi.mocked(axiosApi.post).mockResolvedValue({ data: undefined })
      const store = buildStore()

      await store.dispatch(logoutThunk())

      expect(axiosApi.post).toHaveBeenCalledWith('/auth/logout')
    })
  })
})
