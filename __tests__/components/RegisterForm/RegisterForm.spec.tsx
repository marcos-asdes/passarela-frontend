/**
 * Testes unitários para RegisterForm (integra useRegisterForm)
 *
 * Cenários testados:
 * - cadastro com sucesso: envia payload com cpf/telefone só com dígitos e chama onSuccess
 * - cadastro com e-mail/cpf já cadastrado: mostra alerta de erro e não chama onSuccess
 * - data de nascimento: máscara `00/00/0000` aplicada automaticamente enquanto o usuário digita
 * - data de nascimento: valor mascarado enviado é convertido corretamente pro payload de cadastro
 * - data de nascimento inexistente no calendário: mostra erro de validação e não envia
 * - data de nascimento futura: mostra erro de validação e não envia
 */

import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { RegisterForm } from '@/components/RegisterForm'
import { axiosApi } from '@/services/api/axiosApi'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { post: vi.fn() }
}))

async function fillAndSubmit(screen: ReturnType<typeof renderWithStore>, birthDateDigits = '01011990'): Promise<void> {
  await userEvent.type(screen.getByLabelText('Nome completo'), 'Maria da Silva')
  await userEvent.type(screen.getByLabelText('E-mail'), 'maria@teste.com')
  await userEvent.type(screen.getByLabelText('CPF'), '52998224725')
  await userEvent.type(screen.getByLabelText('Telefone'), '11987654321')
  await userEvent.type(screen.getByLabelText('Data de nascimento'), birthDateDigits)
  await userEvent.type(screen.getByLabelText('Senha'), 'SenhaForte123!')
  await userEvent.type(screen.getByLabelText('Confirmar senha'), 'SenhaForte123!')
  await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))
}

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.mocked(axiosApi.post).mockReset()
  })

  it('cadastro com sucesso envia payload normalizado e chama onSuccess', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { message: 'Conta criada com sucesso.' } })
    const onSuccess = vi.fn()
    const screen = renderWithStore(<RegisterForm role={UserRole.Shopper} onSuccess={onSuccess} />)

    await fillAndSubmit(screen)

    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(axiosApi.post).toHaveBeenCalledWith(
      '/auth/register',
      expect.objectContaining({
        cpf: '52998224725',
        phone: '11987654321',
        birthDate: new Date(1990, 0, 1),
        role: UserRole.Shopper
      })
    )
  })

  it('cadastro com e-mail/cpf já cadastrado mostra alerta de erro e não chama onSuccess', async () => {
    vi.mocked(axiosApi.post).mockRejectedValue({ isAxiosError: true, response: { status: 409 } })
    const onSuccess = vi.fn()
    const screen = renderWithStore(<RegisterForm role={UserRole.Shopper} onSuccess={onSuccess} />)

    await fillAndSubmit(screen)

    expect(await screen.findByText('Este e-mail ou CPF já está cadastrado.')).toBeInTheDocument()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('aplica a máscara 00/00/0000 automaticamente enquanto o usuário digita a data de nascimento', async () => {
    const screen = renderWithStore(<RegisterForm role={UserRole.Shopper} onSuccess={vi.fn()} />)

    await userEvent.type(screen.getByLabelText('Data de nascimento'), '01011990')

    expect(screen.getByLabelText('Data de nascimento')).toHaveValue('01/01/1990')
  })

  it('data de nascimento inexistente no calendário mostra erro de validação e não envia', async () => {
    const onSuccess = vi.fn()
    const screen = renderWithStore(<RegisterForm role={UserRole.Shopper} onSuccess={onSuccess} />)

    await fillAndSubmit(screen, '31022020')

    expect(await screen.findByText('Informe uma data de nascimento válida')).toBeInTheDocument()
    expect(axiosApi.post).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('data de nascimento futura mostra erro de validação e não envia', async () => {
    const onSuccess = vi.fn()
    const screen = renderWithStore(<RegisterForm role={UserRole.Shopper} onSuccess={onSuccess} />)

    await fillAndSubmit(screen, '01012099')

    expect(await screen.findByText('Informe uma data de nascimento válida')).toBeInTheDocument()
    expect(axiosApi.post).not.toHaveBeenCalled()
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
