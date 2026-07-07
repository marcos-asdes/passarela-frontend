/**
 * Testes unitários para Landing
 *
 * Cenários testados:
 * - renderiza os cards de lojista e cliente
 * - clique em "Entrar" do card lojista navega pra /lojista/entrar
 */

import { Route, Routes } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import Landing from '@/pages/Landing'
import { renderWithStore } from '@test-utils'

describe('Landing', () => {
  it('renderiza os cards de lojista e cliente', () => {
    const { getByText } = renderWithStore(
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    )

    expect(getByText('Sou lojista')).toBeInTheDocument()
    expect(getByText('Sou cliente')).toBeInTheDocument()
  })

  it('clique em "Entrar" do card lojista navega pra /lojista/entrar', async () => {
    const { getAllByText, getByText } = renderWithStore(
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/lojista/entrar" element={<div>login do lojista</div>} />
      </Routes>
    )

    await userEvent.click(getAllByText('Entrar')[0])

    expect(getByText('login do lojista')).toBeInTheDocument()
  })
})
