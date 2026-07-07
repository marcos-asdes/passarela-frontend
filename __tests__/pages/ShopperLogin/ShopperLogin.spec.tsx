/**
 * Testes unitários para ShopperLogin
 *
 * Cenários testados:
 * - renderiza título, formulário de login e link pro cadastro
 */

import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ShopperLogin from '@/pages/ShopperLogin'
import { renderWithStore } from '@test-utils'

describe('ShopperLogin', () => {
  it('renderiza título, formulário de login e link pro cadastro', () => {
    const { getByText, getByLabelText } = renderWithStore(
      <Routes>
        <Route path="/" element={<ShopperLogin />} />
      </Routes>
    )

    expect(getByText('Login do cliente')).toBeInTheDocument()
    expect(getByLabelText('E-mail')).toBeInTheDocument()
    expect(getByText('Criar conta')).toHaveAttribute('href', '/cliente/cadastro')
  })
})
