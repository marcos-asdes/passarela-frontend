/**
 * Testes unitários para ShopperFeed (hook mockado)
 *
 * Cenários testados:
 * - mostra o spinner enquanto loading
 * - mostra mensagem de filtro vazio quando não há offers com interesse
 * - offer Active sem interesse: botão "Tenho interesse" habilitado, chama handleRegisterInterest
 * - offer com interesse registrado: botão "Retirar interesse", chama handleRemoveInterest
 * - offer Expired sem interesse: tag "Expirado" e botão desabilitado
 * - offer SoldOut sem interesse: tag "Esgotado" e botão desabilitado
 * - paginação só aparece quando totalOffers > pageSize
 */

import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ShopperFeed from '@/pages/ShopperFeed'
import * as useShopperFeedModule from '@/pages/ShopperFeed/useShopperFeed'
import { OfferStatus } from '@/store/reducers/offers/types'
import { renderWithStore } from '@test-utils'

const offer = {
  id: 'offer-1',
  merchantId: 'merchant-1',
  title: '50% OFF',
  description: 'Promoção',
  discountPercent: 50,
  stock: 10,
  validUntil: '2026-12-31T00:00:00.000Z',
  status: OfferStatus.Active,
  createdAt: '2026-01-01T00:00:00.000Z'
}

function mockUseShopperFeed(overrides: Partial<ReturnType<typeof useShopperFeedModule.useShopperFeed>> = {}) {
  return vi.spyOn(useShopperFeedModule, 'useShopperFeed').mockReturnValue({
    loading: false,
    error: null,
    pagedOffers: [],
    totalOffers: 0,
    currentPage: 1,
    pageSize: 8,
    onPageChange: vi.fn(),
    registeredInterests: {},
    pendingOfferIds: [],
    showOnlyInterests: false,
    handleRegisterInterest: vi.fn(),
    handleRemoveInterest: vi.fn(),
    handleToggleCartFilter: vi.fn(),
    handleSoftReload: vi.fn(),
    ...overrides
  })
}

describe('ShopperFeed', () => {
  it('mostra o spinner enquanto loading', () => {
    const spy = mockUseShopperFeed({ loading: true })

    const { container } = renderWithStore(<ShopperFeed />)

    expect(container.querySelector('.ant-spin')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('mostra mensagem de filtro vazio quando não há offers com interesse', () => {
    const spy = mockUseShopperFeed({ showOnlyInterests: true, pagedOffers: [] })

    renderWithStore(<ShopperFeed />)

    expect(screen.getByText('Você ainda não registrou interesse em nenhuma oferta.')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('offer Active sem interesse: botão habilitado chama handleRegisterInterest', () => {
    const handleRegisterInterest = vi.fn()
    const spy = mockUseShopperFeed({ pagedOffers: [offer], handleRegisterInterest })

    renderWithStore(<ShopperFeed />)
    fireEvent.click(screen.getByText('Tenho interesse'))

    expect(handleRegisterInterest).toHaveBeenCalledWith('offer-1')

    spy.mockRestore()
  })

  it('offer com interesse registrado: botão "Retirar interesse" chama handleRemoveInterest', () => {
    const handleRemoveInterest = vi.fn()
    const spy = mockUseShopperFeed({
      pagedOffers: [offer],
      registeredInterests: { 'offer-1': 'interest-1' },
      handleRemoveInterest
    })

    renderWithStore(<ShopperFeed />)
    fireEvent.click(screen.getByText('Retirar interesse'))

    expect(handleRemoveInterest).toHaveBeenCalledWith('offer-1')

    spy.mockRestore()
  })

  it('offer Expired sem interesse: tag "Expirado" e botão desabilitado', () => {
    const spy = mockUseShopperFeed({ pagedOffers: [{ ...offer, status: OfferStatus.Expired }] })

    renderWithStore(<ShopperFeed />)

    expect(screen.getAllByText('Expirado')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Expirado' })).toBeDisabled()

    spy.mockRestore()
  })

  it('offer SoldOut sem interesse: tag "Esgotado" e botão desabilitado', () => {
    const spy = mockUseShopperFeed({ pagedOffers: [{ ...offer, status: OfferStatus.SoldOut }] })

    renderWithStore(<ShopperFeed />)

    expect(screen.getAllByText('Esgotado')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Esgotado' })).toBeDisabled()

    spy.mockRestore()
  })

  it('paginação só aparece quando totalOffers > pageSize', () => {
    const spy = mockUseShopperFeed({ pagedOffers: [offer], totalOffers: 1 })

    const { rerender } = renderWithStore(<ShopperFeed />)
    expect(screen.queryByText('2')).not.toBeInTheDocument()

    spy.mockReturnValue({
      loading: false,
      error: null,
      pagedOffers: [offer],
      totalOffers: 12,
      currentPage: 1,
      pageSize: 8,
      onPageChange: vi.fn(),
      registeredInterests: {},
      pendingOfferIds: [],
      showOnlyInterests: false,
      handleRegisterInterest: vi.fn(),
      handleRemoveInterest: vi.fn(),
      handleToggleCartFilter: vi.fn(),
      handleSoftReload: vi.fn()
    })
    rerender(<ShopperFeed />)

    expect(screen.getByText('2')).toBeInTheDocument()

    spy.mockRestore()
  })
})
