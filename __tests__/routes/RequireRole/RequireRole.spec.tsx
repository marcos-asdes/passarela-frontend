/**
 * Testes unitários para RequireRole
 *
 * Cenários testados:
 * - redireciona pra "/" quando não há sessão autenticada
 * - redireciona pra "/" quando o papel autenticado é diferente do exigido
 * - renderiza os filhos quando o papel autenticado bate com o exigido
 */

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { RequireRole } from '@/routes/RequireRole'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

function renderProtected(
  role: UserRole,
  preloadedUser: { id: string; role: UserRole } | null
): ReturnType<typeof renderWithStore> {
  return renderWithStore(
    <MemoryRouter initialEntries={['/protegida']}>
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
      </Routes>
    </MemoryRouter>,
    {
      preloadedState: {
        auth: {
          register: { loading: false, error: null, success: false },
          login: { loading: false, error: null, accessToken: preloadedUser ? 'token' : null, user: preloadedUser }
        }
      }
    }
  )
}

describe('RequireRole', () => {
  it('redireciona pra "/" quando não há sessão autenticada', () => {
    const { getByText } = renderProtected(UserRole.Merchant, null)

    expect(getByText('página pública')).toBeInTheDocument()
  })

  it('redireciona pra "/" quando o papel autenticado é diferente do exigido', () => {
    const { getByText } = renderProtected(UserRole.Merchant, { id: 'user-1', role: UserRole.Shopper })

    expect(getByText('página pública')).toBeInTheDocument()
  })

  it('renderiza os filhos quando o papel autenticado bate com o exigido', () => {
    const { getByText } = renderProtected(UserRole.Merchant, { id: 'user-1', role: UserRole.Merchant })

    expect(getByText('conteúdo protegido')).toBeInTheDocument()
  })
})
