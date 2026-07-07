/**
 * Testes unitários para SessionExpiredWatcher
 *
 * Cenários testados:
 * - ao acionar triggerSessionExpired, mostra o modal de sessão expirada
 * - acionar triggerSessionExpired duas vezes seguidas pro mesmo papel mostra só um modal (guarda alreadyShownRef por papel)
 * - acionar pra papéis diferentes mostra um modal pra cada (não se suprimem)
 * - clicar em OK: limpa o login só daquele papel e navega pra "/"
 */

import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { SessionExpiredWatcher } from '@/components/SessionExpiredWatcher'
import { triggerSessionExpired } from '@/services/api/sessionExpiry'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

function renderWatcher() {
  return renderWithStore(
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SessionExpiredWatcher />
            <div>landing</div>
          </>
        }
      />
    </Routes>,
    {
      preloadedState: {
        auth: {
          register: { loading: false, error: null, success: false },
          login: {
            [UserRole.Shopper]: {
              loading: false,
              error: null,
              accessToken: 'token-shopper',
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
      }
    }
  )
}

describe('SessionExpiredWatcher', () => {
  it('ao acionar triggerSessionExpired, mostra o modal de sessão expirada', () => {
    const { getByText, container } = renderWatcher()

    act(() => triggerSessionExpired(UserRole.Shopper))

    expect(getByText('Sua sessão expirou por inatividade. Faça login novamente.')).toBeInTheDocument()
    expect(container.ownerDocument.querySelectorAll('.ant-modal-confirm-title')).toHaveLength(1)
  })

  it('acionar duas vezes seguidas pro mesmo papel mostra só um modal', () => {
    const { container } = renderWatcher()

    act(() => {
      triggerSessionExpired(UserRole.Shopper)
      triggerSessionExpired(UserRole.Shopper)
    })

    expect(container.ownerDocument.querySelectorAll('.ant-modal-confirm-title')).toHaveLength(1)
  })

  it('acionar pra papéis diferentes mostra um modal pra cada', () => {
    const { container } = renderWatcher()

    act(() => {
      triggerSessionExpired(UserRole.Shopper)
      triggerSessionExpired(UserRole.Merchant)
    })

    expect(container.ownerDocument.querySelectorAll('.ant-modal-confirm-title')).toHaveLength(2)
  })

  it('clicar em OK limpa o login só daquele papel e navega pra "/"', async () => {
    const { getByText, store } = renderWatcher()

    act(() => triggerSessionExpired(UserRole.Shopper))
    await userEvent.click(getByText('OK'))

    expect(store.getState().auth.login[UserRole.Shopper].accessToken).toBeNull()
    expect(store.getState().auth.login[UserRole.Merchant].accessToken).toBe('token-merchant')
    expect(getByText('landing')).toBeInTheDocument()
  })
})
