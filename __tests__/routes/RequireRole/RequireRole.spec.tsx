/**
 * Testes unitários para RequireRole
 *
 * Cenários testados:
 * - redireciona pra "/" quando não há sessão autenticada pro papel exigido
 * - redireciona pra "/" quando só existe sessão autenticada no OUTRO papel
 * - renderiza os filhos quando o papel autenticado bate com o exigido
 * - renderiza os filhos pro papel certo mesmo com os dois papéis autenticados ao mesmo tempo
 */

import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { RequireRole } from '@/routes/RequireRole'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

const emptyLoginSession = { loading: false, error: null, accessToken: null, user: null }
const emptyProfileSession = { loading: false, error: null, name: null, email: null }

function renderProtected(
  role: UserRole,
  sessions: Partial<Record<UserRole, { id: string; role: UserRole }>>
): ReturnType<typeof renderWithStore> {
  return renderWithStore(
    <Routes>
      <Route path="/" element={<div>página pública</div>} />
      <Route
        path="/protegida"
        element={
          <RequireRole role={role}>
            <div>conteúdo protegido</div>
          </RequireRole>
        }
      />
    </Routes>,
    {
      route: '/protegida',
      preloadedState: {
        auth: {
          register: { loading: false, error: null, success: false },
          login: {
            [UserRole.Merchant]: sessions[UserRole.Merchant]
              ? { ...emptyLoginSession, accessToken: 'token', user: sessions[UserRole.Merchant] ?? null }
              : emptyLoginSession,
            [UserRole.Shopper]: sessions[UserRole.Shopper]
              ? { ...emptyLoginSession, accessToken: 'token', user: sessions[UserRole.Shopper] ?? null }
              : emptyLoginSession
          },
          profile: { [UserRole.Merchant]: emptyProfileSession, [UserRole.Shopper]: emptyProfileSession }
        }
      }
    }
  )
}

describe('RequireRole', () => {
  it('redireciona pra "/" quando não há sessão autenticada pro papel exigido', () => {
    const { getByText } = renderProtected(UserRole.Merchant, {})

    expect(getByText('página pública')).toBeInTheDocument()
  })

  it('redireciona pra "/" quando só existe sessão autenticada no OUTRO papel', () => {
    const { getByText } = renderProtected(UserRole.Merchant, {
      [UserRole.Shopper]: { id: 'user-1', role: UserRole.Shopper }
    })

    expect(getByText('página pública')).toBeInTheDocument()
  })

  it('renderiza os filhos quando o papel autenticado bate com o exigido', () => {
    const { getByText } = renderProtected(UserRole.Merchant, {
      [UserRole.Merchant]: { id: 'user-1', role: UserRole.Merchant }
    })

    expect(getByText('conteúdo protegido')).toBeInTheDocument()
  })

  it('renderiza os filhos pro papel certo mesmo com os dois papéis autenticados ao mesmo tempo', () => {
    const { getByText } = renderProtected(UserRole.Shopper, {
      [UserRole.Merchant]: { id: 'user-1', role: UserRole.Merchant },
      [UserRole.Shopper]: { id: 'user-2', role: UserRole.Shopper }
    })

    expect(getByText('conteúdo protegido')).toBeInTheDocument()
  })
})
