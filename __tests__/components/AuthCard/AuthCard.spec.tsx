/**
 * Testes unitários para AuthCard
 *
 * Cenários testados:
 * - renderiza título, subtítulo, children e footer
 * - não renderiza subtítulo/footer quando não informados
 * - link de voltar aponta para a landing ("/")
 */

import { describe, expect, it } from 'vitest'

import { AuthCard } from '@/components/AuthCard'
import { renderWithStore } from '@test-utils'

describe('AuthCard', () => {
  it('renderiza título, subtítulo, children e footer', () => {
    const { getByText } = renderWithStore(
      <AuthCard title="Login do lojista" subtitle="Acesse sua loja" footer={<span>Rodapé</span>}>
        <div>Formulário</div>
      </AuthCard>
    )

    expect(getByText('Login do lojista')).toBeInTheDocument()
    expect(getByText('Acesse sua loja')).toBeInTheDocument()
    expect(getByText('Formulário')).toBeInTheDocument()
    expect(getByText('Rodapé')).toBeInTheDocument()
  })

  it('não renderiza subtítulo/footer quando não informados', () => {
    const { queryByText } = renderWithStore(
      <AuthCard title="Login do lojista">
        <div>Formulário</div>
      </AuthCard>
    )

    expect(queryByText('Acesse sua loja')).not.toBeInTheDocument()
  })

  it('link de voltar aponta para a landing ("/")', () => {
    const { getByText } = renderWithStore(
      <AuthCard title="Login do lojista">
        <div>Formulário</div>
      </AuthCard>
    )

    expect(getByText('← Voltar para o Passarela')).toHaveAttribute('href', '/')
  })
})
