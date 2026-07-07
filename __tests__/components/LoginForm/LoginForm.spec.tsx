/**
 * Testes unitários para LoginForm (integra useLoginForm)
 *
 * Cenários testados:
 * - login com sucesso e papel correto: navega pro dashboard/feed do papel
 * - login com papel incorreto: mostra alerta com link pro login correto
 * - login com credenciais inválidas: mostra alerta de erro
 * - loggedIn true (hook mockado): mostra o alerta de sucesso em vez do formulário
 */

import { Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from '@/components/LoginForm'
import * as useLoginFormModule from '@/components/LoginForm/useLoginForm'
import { axiosApi } from '@/services/api/axiosApi'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { post: vi.fn() }
}))

function renderLoginForm() {
  return renderWithStore(
    <Routes>
      <Route path="/" element={<LoginForm role={UserRole.Merchant} otherRoleLoginPath="/cliente/entrar" />} />
      <Route path="/lojista/painel" element={<div>painel do lojista</div>} />
      <Route path="/cliente/entrar" element={<div>login do cliente</div>} />
    </Routes>
  )
}

async function submitForm(screen: ReturnType<typeof renderWithStore>): Promise<void> {
  await userEvent.type(screen.getByLabelText('E-mail'), 'lojista@teste.com')
  await userEvent.type(screen.getByLabelText('Senha'), 'SenhaForte123!')
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(axiosApi.post).mockReset()
  })

  it('login com sucesso e papel correto navega pro painel', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({
      data: { accessToken: 'token-123', user: { id: 'user-1', role: UserRole.Merchant } }
    })
    const screen = renderLoginForm()

    await submitForm(screen)

    expect(await screen.findByText('painel do lojista')).toBeInTheDocument()
  })

  it('login com papel incorreto mostra alerta com link pro login correto', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({
      data: { accessToken: 'token-123', user: { id: 'user-1', role: UserRole.Shopper } }
    })
    const screen = renderLoginForm()

    await submitForm(screen)

    expect(await screen.findByText('Login incorreto')).toBeInTheDocument()
    expect(await screen.findByText('Ir para o login correto')).toHaveAttribute('href', '/cliente/entrar')
  })

  it('login com credenciais inválidas mostra alerta de erro', async () => {
    vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 401 } })
    const screen = renderLoginForm()

    await submitForm(screen)

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument()
  })

  it('loggedIn true (hook mockado) mostra o alerta de sucesso em vez do formulário', () => {
    const spy = vi.spyOn(useLoginFormModule, 'useLoginForm').mockReturnValue({
      loading: false,
      error: null,
      roleMismatch: false,
      loggedIn: true,
      handleSubmit: vi.fn()
    })

    const { getByText, queryByLabelText } = renderWithStore(
      <LoginForm role={UserRole.Merchant} otherRoleLoginPath="/cliente/entrar" />
    )

    expect(getByText('Login realizado com sucesso')).toBeInTheDocument()
    expect(queryByLabelText('E-mail')).not.toBeInTheDocument()

    spy.mockRestore()
  })
})
