/**
 * Testes unitários para AppHeader (hook mockado)
 *
 * Cenários testados:
 * - mostra "..." como nome enquanto o perfil não chegou, e-mail só aparece quando presente
 * - carrinho só aparece pro papel shopper (via prop role)
 * - clique em "Sair" chama handleLogout
 * - clique no logo chama onLogoClick
 */

import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi, type Mock } from 'vitest'

import { AppHeader } from '@/components/AppHeader'
import type { UseAppHeaderReturn } from '@/components/AppHeader/types'
import * as useAppHeaderModule from '@/components/AppHeader/useAppHeader'
import { UserRole } from '@/store/reducers/auth/types'
import { renderWithStore } from '@test-utils'

function mockUseAppHeader(overrides: Partial<UseAppHeaderReturn> = {}): Mock<(role: UserRole) => UseAppHeaderReturn> {
  return vi.spyOn(useAppHeaderModule, 'useAppHeader').mockReturnValue({
    visible: true,
    name: null,
    email: null,
    cartCount: 0,
    handleLogout: vi.fn(),
    ...overrides
  })
}

describe('AppHeader', () => {
  it('mostra "..." como nome enquanto o perfil não chegou, e-mail só aparece quando presente', () => {
    const spy = mockUseAppHeader()

    const { getByText, queryByText } = renderWithStore(<AppHeader role={UserRole.Shopper} />)

    expect(getByText('Olá, ...')).toBeInTheDocument()
    expect(queryByText('maria@teste.com')).not.toBeInTheDocument()

    spy.mockRestore()
  })

  it('mostra nome e e-mail quando disponíveis', () => {
    const spy = mockUseAppHeader({ name: 'Maria', email: 'maria@teste.com' })

    const { getByText } = renderWithStore(<AppHeader role={UserRole.Shopper} />)

    expect(getByText('Olá, Maria')).toBeInTheDocument()
    expect(getByText('maria@teste.com')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('carrinho só aparece pro papel shopper', () => {
    const spy = mockUseAppHeader()

    const { queryByLabelText, rerender } = renderWithStore(<AppHeader role={UserRole.Merchant} />)
    expect(queryByLabelText('Interesses registrados')).not.toBeInTheDocument()

    rerender(<AppHeader role={UserRole.Shopper} />)

    expect(queryByLabelText('Interesses registrados')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('clique em "Sair" chama handleLogout', async () => {
    const handleLogout = vi.fn()
    const spy = mockUseAppHeader({ handleLogout })

    const { getByText } = renderWithStore(<AppHeader role={UserRole.Shopper} />)
    await userEvent.click(getByText('Sair'))

    expect(handleLogout).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })

  it('clique no logo chama onLogoClick', async () => {
    const spy = mockUseAppHeader()
    const onLogoClick = vi.fn()

    const { getByText } = renderWithStore(<AppHeader role={UserRole.Shopper} onLogoClick={onLogoClick} />)
    await userEvent.click(getByText('Passarela'))

    expect(onLogoClick).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })
})
