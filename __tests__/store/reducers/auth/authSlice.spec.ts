/**
 * Testes unitários para o reducer `auth` (slice)
 *
 * Cenários testados:
 * - registerThunk.pending/fulfilled/rejected atualizam loading/error/success de `register`
 * - registerReset limpa o estado de `register`
 * - loginThunk.pending/fulfilled/rejected atualizam loading/error/accessToken/user de `login`
 * - fetchProfileThunk.pending/fulfilled/rejected atualizam loading/error/name/email de `profile`
 * - logout reseta `login` e `profile`
 */

import { describe, expect, it } from 'vitest'

import { fetchProfileThunk, loginThunk, registerThunk } from '@/store/reducers/auth/thunk'
import { UserRole } from '@/store/reducers/auth/types'
import reducer, { initialState, logout, registerReset } from '@/store/reducers/auth/slice'

describe('auth slice', () => {
  describe('register', () => {
    it('registerThunk.pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, register: { ...initialState.register, error: 'erro antigo' } }

      const state = reducer(seeded, { type: registerThunk.pending.type })

      expect(state.register.loading).toBe(true)
      expect(state.register.error).toBeNull()
    })

    it('registerThunk.fulfilled marca success', () => {
      const state = reducer(initialState, { type: registerThunk.fulfilled.type })

      expect(state.register.loading).toBe(false)
      expect(state.register.success).toBe(true)
    })

    it('registerThunk.rejected guarda a mensagem de erro', () => {
      const action = { type: registerThunk.rejected.type, payload: 'e-mail já cadastrado' }

      const state = reducer(initialState, action)

      expect(state.register.loading).toBe(false)
      expect(state.register.error).toBe('e-mail já cadastrado')
    })

    it('registerThunk.rejected sem payload cai na mensagem genérica', () => {
      const action = { type: registerThunk.rejected.type, payload: undefined }

      const state = reducer(initialState, action)

      expect(state.register.error).toBe('Something went wrong. Please try again.')
    })

    it('registerReset limpa o estado de register', () => {
      const seeded = { ...initialState, register: { loading: false, error: 'erro', success: true } }

      const state = reducer(seeded, registerReset())

      expect(state.register).toEqual(initialState.register)
    })
  })

  describe('login', () => {
    it('loginThunk.pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, login: { ...initialState.login, error: 'erro antigo' } }

      const state = reducer(seeded, { type: loginThunk.pending.type })

      expect(state.login.loading).toBe(true)
      expect(state.login.error).toBeNull()
    })

    it('loginThunk.fulfilled guarda accessToken e user', () => {
      const payload = { accessToken: 'token-123', user: { id: 'user-1', role: UserRole.Shopper } }

      const state = reducer(initialState, { type: loginThunk.fulfilled.type, payload })

      expect(state.login.loading).toBe(false)
      expect(state.login.accessToken).toBe('token-123')
      expect(state.login.user).toEqual(payload.user)
    })

    it('loginThunk.rejected guarda a mensagem de erro', () => {
      const action = { type: loginThunk.rejected.type, payload: 'credenciais inválidas' }

      const state = reducer(initialState, action)

      expect(state.login.loading).toBe(false)
      expect(state.login.error).toBe('credenciais inválidas')
    })

    it('logout reseta login e profile', () => {
      const seeded = {
        ...initialState,
        login: { loading: false, error: null, accessToken: 'token', user: { id: 'user-1', role: UserRole.Shopper } },
        profile: { loading: false, error: null, name: 'Maria', email: 'maria@teste.com' }
      }

      const state = reducer(seeded, logout())

      expect(state.login).toEqual(initialState.login)
      expect(state.profile).toEqual(initialState.profile)
    })
  })

  describe('profile', () => {
    it('fetchProfileThunk.pending marca loading e limpa erro', () => {
      const seeded = { ...initialState, profile: { ...initialState.profile, error: 'erro antigo' } }

      const state = reducer(seeded, { type: fetchProfileThunk.pending.type })

      expect(state.profile.loading).toBe(true)
      expect(state.profile.error).toBeNull()
    })

    it('fetchProfileThunk.fulfilled guarda name e email', () => {
      const payload = { name: 'Maria', email: 'maria@teste.com' }

      const state = reducer(initialState, { type: fetchProfileThunk.fulfilled.type, payload })

      expect(state.profile.loading).toBe(false)
      expect(state.profile.name).toBe('Maria')
      expect(state.profile.email).toBe('maria@teste.com')
    })

    it('fetchProfileThunk.rejected guarda a mensagem de erro', () => {
      const action = { type: fetchProfileThunk.rejected.type, payload: 'sessão expirada' }

      const state = reducer(initialState, action)

      expect(state.profile.loading).toBe(false)
      expect(state.profile.error).toBe('sessão expirada')
    })
  })
})
