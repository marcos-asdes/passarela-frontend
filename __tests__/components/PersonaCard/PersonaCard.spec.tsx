/**
 * Testes unitários para PersonaCard (integra usePersonaCard)
 *
 * Cenários testados:
 * - renderiza título, descrição e ícone
 * - clique em "Entrar" navega pra loginTo
 * - clique em "Cadastrar" navega pra registerTo
 */

import { Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PersonaCard } from '@/components/PersonaCard'
import { renderWithStore } from '@test-utils'

function renderPersonaCard() {
  return renderWithStore(
    <Routes>
      <Route
        path="/"
        element={
          <PersonaCard
            icon={<span>ícone</span>}
            title="Sou lojista"
            description="Publique ofertas relâmpago"
            loginTo="/lojista/entrar"
            registerTo="/lojista/cadastro"
          />
        }
      />
      <Route path="/lojista/entrar" element={<div>página de login</div>} />
      <Route path="/lojista/cadastro" element={<div>página de cadastro</div>} />
    </Routes>
  )
}

describe('PersonaCard', () => {
  it('renderiza título, descrição e ícone', () => {
    const { getByText } = renderPersonaCard()

    expect(getByText('Sou lojista')).toBeInTheDocument()
    expect(getByText('Publique ofertas relâmpago')).toBeInTheDocument()
    expect(getByText('ícone')).toBeInTheDocument()
  })

  it('clique em "Entrar" navega pra loginTo', async () => {
    const { getByText } = renderPersonaCard()

    await userEvent.click(getByText('Entrar'))

    expect(getByText('página de login')).toBeInTheDocument()
  })

  it('clique em "Cadastrar" navega pra registerTo', async () => {
    const { getByText } = renderPersonaCard()

    await userEvent.click(getByText('Cadastrar'))

    expect(getByText('página de cadastro')).toBeInTheDocument()
  })
})
