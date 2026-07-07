/**
 * Testes unitários para MerchantRegister (integra useMerchantRegister)
 *
 * Cenários testados:
 * - cadastro com sucesso: avisa e navega pro login do lojista
 */

import { Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import MerchantRegister from '@/pages/MerchantRegister'
import { axiosApi } from '@/services/api/axiosApi'
import { renderWithStore } from '@test-utils'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { post: vi.fn() }
}))

describe('MerchantRegister', () => {
  it('cadastro com sucesso avisa e navega pro login do lojista', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { message: 'Conta criada com sucesso.' } })
    const screen = renderWithStore(
      <Routes>
        <Route path="/" element={<MerchantRegister />} />
        <Route path="/lojista/entrar" element={<div>login do lojista</div>} />
      </Routes>
    )

    await userEvent.type(screen.getByLabelText('Nome completo'), 'João Lojista')
    await userEvent.type(screen.getByLabelText('E-mail'), 'joao@teste.com')
    await userEvent.type(screen.getByLabelText('CPF'), '52998224725')
    await userEvent.type(screen.getByLabelText('Telefone'), '11987654321')
    await userEvent.type(screen.getByLabelText('Data de nascimento'), '01/01/1990{Escape}')
    await userEvent.type(screen.getByLabelText('Senha'), 'SenhaForte123!')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'SenhaForte123!')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('login do lojista')).toBeInTheDocument()
    expect(await screen.findByText('Conta criada. Faça login para continuar.')).toBeInTheDocument()
  })
})
