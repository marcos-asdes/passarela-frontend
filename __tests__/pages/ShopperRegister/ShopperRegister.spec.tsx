/**
 * Testes unitários para ShopperRegister (integra useShopperRegister)
 *
 * Cenários testados:
 * - cadastro com sucesso: avisa e navega pro login do cliente
 */

import { Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ShopperRegister from '@/pages/ShopperRegister'
import { axiosApi } from '@/services/api/axiosApi'
import { renderWithStore } from '@test-utils'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { post: vi.fn() }
}))

describe('ShopperRegister', () => {
  it('cadastro com sucesso avisa e navega pro login do cliente', async () => {
    vi.mocked(axiosApi.post).mockResolvedValue({ data: { message: 'Conta criada com sucesso.' } })
    const screen = renderWithStore(
      <Routes>
        <Route path="/" element={<ShopperRegister />} />
        <Route path="/cliente/entrar" element={<div>login do cliente</div>} />
      </Routes>
    )

    await userEvent.type(screen.getByLabelText('Nome completo'), 'Maria Cliente')
    await userEvent.type(screen.getByLabelText('E-mail'), 'maria@teste.com')
    await userEvent.type(screen.getByLabelText('CPF'), '52998224725')
    await userEvent.type(screen.getByLabelText('Telefone'), '11987654321')
    await userEvent.type(screen.getByLabelText('Data de nascimento'), '01/01/1990{Escape}')
    await userEvent.type(screen.getByLabelText('Senha'), 'SenhaForte123!')
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'SenhaForte123!')
    await userEvent.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByText('login do cliente')).toBeInTheDocument()
    expect(await screen.findByText('Conta criada. Faça login para continuar.')).toBeInTheDocument()
  })
})
