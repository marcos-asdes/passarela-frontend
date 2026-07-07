/**
 * Testes unitários para MerchantLogin
 *
 * Cenários testados:
 * - renderiza título, formulário de login e link pro cadastro
 */

import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import MerchantLogin from '@/pages/MerchantLogin'
import { renderWithStore } from '@test-utils'

describe('MerchantLogin', () => {
  it('renderiza título, formulário de login e link pro cadastro', () => {
    const { getByText, getByLabelText } = renderWithStore(
      <Routes>
        <Route path="/" element={<MerchantLogin />} />
      </Routes>
    )

    expect(getByText('Login do lojista')).toBeInTheDocument()
    expect(getByLabelText('E-mail')).toBeInTheDocument()
    expect(getByText('Criar conta')).toHaveAttribute('href', '/lojista/cadastro')
  })
})
