/**
 * Testes unitários para SessionExpiredWatcher
 *
 * Cenários testados:
 * - ao acionar triggerSessionExpired, mostra o modal de sessão expirada
 * - acionar triggerSessionExpired duas vezes seguidas mostra só um modal (guarda alreadyShownRef)
 * - clicar em OK: limpa o login, purga o persist e navega pra "/"
 */

import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SessionExpiredWatcher } from '@/components/SessionExpiredWatcher'
import { triggerSessionExpired } from '@/services/api/sessionExpiry'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

const purgeMock = vi.fn()

vi.mock('@/store', () => ({
  persistor: { purge: (): unknown => purgeMock() }
}))

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
            loading: false,
            error: null,
            accessToken: 'token-123',
            user: { id: 'user-1', role: UserRole.Shopper }
          },
          profile: { loading: false, error: null, name: 'Maria', email: 'maria@teste.com' }
        }
      }
    }
  )
}

describe('SessionExpiredWatcher', () => {
  beforeEach(() => {
    purgeMock.mockClear()
  })

  it('ao acionar triggerSessionExpired, mostra o modal de sessão expirada', () => {
    const { getByText, container } = renderWatcher()

    act(() => triggerSessionExpired())

    expect(getByText('Sua sessão expirou por inatividade. Faça login novamente.')).toBeInTheDocument()
    expect(container.ownerDocument.querySelectorAll('.ant-modal-confirm-title')).toHaveLength(1)
  })

  it('acionar duas vezes seguidas mostra só um modal', () => {
    const { container } = renderWatcher()

    act(() => {
      triggerSessionExpired()
      triggerSessionExpired()
    })

    expect(container.ownerDocument.querySelectorAll('.ant-modal-confirm-title')).toHaveLength(1)
  })

  it('clicar em OK limpa o login, purga o persist e navega pra "/"', async () => {
    const { getByText, store } = renderWatcher()

    act(() => triggerSessionExpired())
    await userEvent.click(getByText('OK'))

    expect(store.getState().auth.login.accessToken).toBeNull()
    expect(purgeMock).toHaveBeenCalledTimes(1)
    expect(getByText('landing')).toBeInTheDocument()
  })
})
