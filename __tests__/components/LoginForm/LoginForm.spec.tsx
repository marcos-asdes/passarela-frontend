/**
 * Testes unitários para LoginForm (integra useLoginForm)
 *
 * Cenários testados:
 * - login com sucesso: navega pro dashboard/feed do papel da página
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
      <Route path="/" element={<LoginForm role={UserRole.Merchant} />} />
      <Route path="/lojista/painel" element={<div>painel do lojista</div>} />
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

  it('login com sucesso navega pro painel', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({
      data: { accessToken: 'token-123', user: { id: 'user-1', role: UserRole.Merchant } }
    })
    const screen = renderLoginForm()

    await submitForm(screen)

    expect(await screen.findByText('painel do lojista')).toBeInTheDocument()
    expect(axiosApi.post).toHaveBeenCalledWith('/auth/login', {
      email: 'lojista@teste.com',
      password: 'SenhaForte123!',
      role: UserRole.Merchant
    })
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
      loggedIn: true,
      handleSubmit: vi.fn()
    })

    const { getByText, queryByLabelText } = renderWithStore(<LoginForm role={UserRole.Merchant} />)

    expect(getByText('Login realizado com sucesso')).toBeInTheDocument()
    expect(queryByLabelText('E-mail')).not.toBeInTheDocument()

    spy.mockRestore()
  })
})
