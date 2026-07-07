/**
 * Testes unitários para a sincronização entre abas do store (`window` "storage" event)
 *
 * Cenários testados:
 * - quando outra aba escreve uma sessão nova no localStorage, esta aba reidrata e passa a
 *   enxergar aquela sessão também, sem derrubar a sessão que já tinha em memória
 * - conteúdo idêntico ao já em memória não redespacha REHYDRATE — guarda contra o loop
 *   infinito entre abas (cada REHYDRATE dispara nova escrita, que dispara "storage" na outra aba)
 */

import { waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import store from '@/store'
import { loginThunk } from '@/store/reducers/auth/thunk'
import { UserRole } from '@/store/reducers/auth/types'

const STORAGE_KEY = 'persist:passarela_auth_v2'

describe('sincronização entre abas (store/index.ts)', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('reidrata auth.login com a sessão escrita por outra aba, sem perder a sessão local', async () => {
    store.dispatch({
      type: loginThunk.fulfilled.type,
      payload: { accessToken: 'token-merchant', user: { id: 'merchant-1', role: UserRole.Merchant } },
      meta: { arg: { email: 'lojista@teste.com', password: 'x', role: UserRole.Merchant } }
    })

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull())

    // Simula outra aba: parte do valor real persistido por ESTA aba (garante o formato certo do
    // redux-persist), e adiciona a sessão shopper que só existiria na memória da OUTRA aba.
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) as string)
    const login = JSON.parse(persisted.login)
    login[UserRole.Shopper] = {
      loading: false,
      error: null,
      accessToken: 'token-shopper-outra-aba',
      user: { id: 'shopper-1', role: UserRole.Shopper }
    }
    persisted.login = JSON.stringify(login)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))

    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))

    await waitFor(() =>
      expect(store.getState().auth.login[UserRole.Shopper].accessToken).toBe('token-shopper-outra-aba')
    )
    expect(store.getState().auth.login[UserRole.Merchant].accessToken).toBe('token-merchant')
  })

  it('não redespacha REHYDRATE quando o storage já reflete o state atual', async () => {
    store.dispatch({
      type: loginThunk.fulfilled.type,
      payload: { accessToken: 'token-merchant', user: { id: 'merchant-1', role: UserRole.Merchant } },
      meta: { arg: { email: 'lojista@teste.com', password: 'x', role: UserRole.Merchant } }
    })

    await waitFor(() => expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull())

    const dispatchSpy = vi.spyOn(store, 'dispatch')

    // Mesma aba "escrevendo de novo" o valor já persistido — simula o ciphertext mudar sem
    // o conteúdo decriptografado ter mudado (é exatamente o que causava o loop em produção).
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }))
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'persist/REHYDRATE' }))

    dispatchSpy.mockRestore()
  })
})
