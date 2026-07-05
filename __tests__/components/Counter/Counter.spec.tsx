/**
 * Testes unitários para Counter
 *
 * Cenários testados:
 * - Renderiza o valor inicial vindo do state
 * - Incrementa ao clicar em "+"
 * - Decrementa ao clicar em "-"
 */

import { describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/react'

import { Counter } from '@/components/Counter'
import { renderWithStore } from '@test-utils'

describe('Counter', () => {
  it('renderiza o valor inicial do estado', () => {
    renderWithStore(<Counter />, {
      preloadedState: { counter: { value: 3 }, health: { data: null, loading: false, error: null } }
    })

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('incrementa ao clicar em "+"', async () => {
    const user = userEvent.setup()
    renderWithStore(<Counter />)

    await user.click(screen.getByRole('button', { name: '+' }))

    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrementa ao clicar em "-"', async () => {
    const user = userEvent.setup()
    renderWithStore(<Counter />)

    await user.click(screen.getByRole('button', { name: '-' }))

    expect(screen.getByText('-1')).toBeInTheDocument()
  })
})
