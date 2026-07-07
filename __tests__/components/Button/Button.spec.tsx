/**
 * Testes unitários para Button
 *
 * Cenários testados:
 * - renderiza o texto recebido
 * - chama onClick ao ser clicado
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '@/components/Button'

describe('Button', () => {
  it('renderiza o texto recebido', () => {
    render(<Button>Publicar oferta</Button>)

    expect(screen.getByText('Publicar oferta')).toBeInTheDocument()
  })

  it('chama onClick ao ser clicado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Entrar</Button>)

    await userEvent.click(screen.getByText('Entrar'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
