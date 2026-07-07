/**
 * Testes unitários para TextInput/PasswordInput
 *
 * Cenários testados:
 * - TextInput aceita digitação
 * - PasswordInput aceita digitação e mascara o valor
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PasswordInput, TextInput } from '@/components/Input'

describe('TextInput', () => {
  it('aceita digitação', async () => {
    render(<TextInput placeholder="voce@exemplo.com" />)

    const input = screen.getByPlaceholderText('voce@exemplo.com')
    await userEvent.type(input, 'maria@teste.com')

    expect(input).toHaveValue('maria@teste.com')
  })
})

describe('PasswordInput', () => {
  it('aceita digitação e mascara o valor', async () => {
    render(<PasswordInput placeholder="Sua senha" />)

    const input = screen.getByPlaceholderText('Sua senha')
    await userEvent.type(input, 'SenhaForte123!')

    expect(input).toHaveValue('SenhaForte123!')
    expect(input).toHaveAttribute('type', 'password')
  })
})
