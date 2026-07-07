/**
 * Testes unitários para o reducer `auth` (slice)
 *
 * Cenários testados:
 * - registerThunk.pending/fulfilled/rejected atualizam loading/error/success de `register`
 * - registerReset limpa o estado de `register`
 * - loginThunk.pending/fulfilled/rejected atualizam loading/error/accessToken/user do papel em `login`
 * - fetchProfileThunk.pending/fulfilled/rejected atualizam loading/error/name/email do papel em `profile`
 * - logout(role) reseta login/profile só daquele papel
 * - logout de um papel não afeta o outro (merchant e shopper coexistem)
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
    it('loginThunk.pending marca loading e limpa erro só do papel do payload', () => {
      const seeded = {
        ...initialState,
        login: {
          ...initialState.login,
          [UserRole.Shopper]: { ...initialState.login[UserRole.Shopper], error: 'erro antigo' }
        }
      }

      const state = reducer(seeded, {
        type: loginThunk.pending.type,
        meta: { arg: { email: 'a@a.com', password: 'x', role: UserRole.Shopper } }
      })

      expect(state.login[UserRole.Shopper].loading).toBe(true)
      expect(state.login[UserRole.Shopper].error).toBeNull()
      expect(state.login[UserRole.Merchant]).toEqual(initialState.login[UserRole.Merchant])
    })

    it('loginThunk.fulfilled guarda accessToken e user no papel do payload', () => {
      const payload = { accessToken: 'token-123', user: { id: 'user-1', role: UserRole.Shopper } }

      const state = reducer(initialState, {
        type: loginThunk.fulfilled.type,
        payload,
        meta: { arg: { email: 'a@a.com', password: 'x', role: UserRole.Shopper } }
      })

      expect(state.login[UserRole.Shopper].loading).toBe(false)
      expect(state.login[UserRole.Shopper].accessToken).toBe('token-123')
      expect(state.login[UserRole.Shopper].user).toEqual(payload.user)
      expect(state.login[UserRole.Merchant]).toEqual(initialState.login[UserRole.Merchant])
    })

    it('loginThunk.rejected guarda a mensagem de erro no papel do payload', () => {
      const action = {
        type: loginThunk.rejected.type,
        payload: 'credenciais inválidas',
        meta: { arg: { email: 'a@a.com', password: 'x', role: UserRole.Merchant } }
      }

      const state = reducer(initialState, action)

      expect(state.login[UserRole.Merchant].loading).toBe(false)
      expect(state.login[UserRole.Merchant].error).toBe('credenciais inválidas')
    })

    it('logout(role) reseta login e profile só daquele papel', () => {
      const seeded = {
        ...initialState,
        login: {
          [UserRole.Shopper]: {
            loading: false,
            error: null,
            accessToken: 'token',
            user: { id: 'user-1', role: UserRole.Shopper }
          },
          [UserRole.Merchant]: {
            loading: false,
            error: null,
            accessToken: 'token-merchant',
            user: { id: 'user-2', role: UserRole.Merchant }
          }
        },
        profile: {
          [UserRole.Shopper]: { loading: false, error: null, name: 'Maria', email: 'maria@teste.com' },
          [UserRole.Merchant]: { loading: false, error: null, name: 'João', email: 'joao@teste.com' }
        }
      }

      const state = reducer(seeded, logout(UserRole.Shopper))

      expect(state.login[UserRole.Shopper]).toEqual(initialState.login[UserRole.Shopper])
      expect(state.profile[UserRole.Shopper]).toEqual(initialState.profile[UserRole.Shopper])
      expect(state.login[UserRole.Merchant]).toEqual(seeded.login[UserRole.Merchant])
      expect(state.profile[UserRole.Merchant]).toEqual(seeded.profile[UserRole.Merchant])
    })
  })

  describe('profile', () => {
    it('fetchProfileThunk.pending marca loading e limpa erro só do papel do argumento', () => {
      const seeded = {
        ...initialState,
        profile: {
          ...initialState.profile,
          [UserRole.Merchant]: { ...initialState.profile[UserRole.Merchant], error: 'erro antigo' }
        }
      }

      const state = reducer(seeded, { type: fetchProfileThunk.pending.type, meta: { arg: UserRole.Merchant } })

      expect(state.profile[UserRole.Merchant].loading).toBe(true)
      expect(state.profile[UserRole.Merchant].error).toBeNull()
    })

    it('fetchProfileThunk.fulfilled guarda name e email no papel do argumento', () => {
      const payload = { name: 'Maria', email: 'maria@teste.com' }

      const state = reducer(initialState, {
        type: fetchProfileThunk.fulfilled.type,
        payload,
        meta: { arg: UserRole.Shopper }
      })

      expect(state.profile[UserRole.Shopper].loading).toBe(false)
      expect(state.profile[UserRole.Shopper].name).toBe('Maria')
      expect(state.profile[UserRole.Shopper].email).toBe('maria@teste.com')
    })

    it('fetchProfileThunk.rejected guarda a mensagem de erro no papel do argumento', () => {
      const action = {
        type: fetchProfileThunk.rejected.type,
        payload: 'sessão expirada',
        meta: { arg: UserRole.Merchant }
      }

      const state = reducer(initialState, action)

      expect(state.profile[UserRole.Merchant].loading).toBe(false)
      expect(state.profile[UserRole.Merchant].error).toBe('sessão expirada')
    })
  })
})
