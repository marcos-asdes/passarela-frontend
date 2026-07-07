/**
 * Testes unitários para MerchantDashboard (hook mockado)
 *
 * Cenários testados:
 * - mostra o alerta de erro quando error está preenchido
 * - renderiza uma linha por offer, com o status traduzido
 * - "Encerrar" aparece só pra offers Active/SoldOut e chama handleClose com o id
 * - clique em "Nova oferta" chama handleOpenModal
 * - modal aberto (isModalOpen true): renderiza os campos do formulário de criação
 */

import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MerchantDashboard from '@/pages/MerchantDashboard'
import * as useMerchantDashboardModule from '@/pages/MerchantDashboard/useMerchantDashboard'
import { OfferStatus } from '@/store/reducers/offers/types'
import { renderWithStore } from '@test-utils'

vi.mock('@/services/api/axiosApi', () => ({
  axiosApi: { get: vi.fn().mockResolvedValue({ data: {} }), post: vi.fn() }
}))

const offer = {
  id: 'offer-1',
  merchantId: 'merchant-1',
  title: '50% OFF',
  description: 'Promoção',
  discountPercent: 50,
  stock: 10,
  validUntil: '2026-12-31T00:00:00.000Z',
  status: OfferStatus.Active,
  createdAt: '2026-01-01T00:00:00.000Z',
  interestCount: 3
}

function mockUseMerchantDashboard(
  overrides: Partial<ReturnType<typeof useMerchantDashboardModule.useMerchantDashboard>> = {}
) {
  return vi.spyOn(useMerchantDashboardModule, 'useMerchantDashboard').mockReturnValue({
    loading: false,
    error: null,
    offers: [],
    isModalOpen: false,
    createLoading: false,
    createError: null,
    closeLoading: false,
    handleOpenModal: vi.fn(),
    handleCloseModal: vi.fn(),
    handleCreateSubmit: vi.fn(),
    handleClose: vi.fn(),
    handleSoftReload: vi.fn(),
    ...overrides
  })
}

describe('MerchantDashboard', () => {
  it('mostra o alerta de erro quando error está preenchido', () => {
    const spy = mockUseMerchantDashboard({ error: 'falha ao buscar' })

    renderWithStore(<MerchantDashboard />)

    expect(screen.getByText('falha ao buscar')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('renderiza uma linha por offer, com o status traduzido', () => {
    const spy = mockUseMerchantDashboard({ offers: [offer] })

    renderWithStore(<MerchantDashboard />)

    const row = screen.getByRole('row', { name: /50% OFF/ })
    expect(within(row).getByText('Ativa')).toBeInTheDocument()
    expect(within(row).getByText('50%')).toBeInTheDocument()
    expect(within(row).getByText('3')).toBeInTheDocument()

    spy.mockRestore()
  })

  it('"Encerrar" aparece só pra Active/SoldOut e chama handleClose com o id', () => {
    const handleClose = vi.fn()
    const spy = mockUseMerchantDashboard({
      offers: [offer, { ...offer, id: 'offer-2', status: OfferStatus.Closed }],
      handleClose
    })

    renderWithStore(<MerchantDashboard />)

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('Encerrar')).toBeInTheDocument()
    expect(within(rows[2]).queryByText('Encerrar')).not.toBeInTheDocument()

    fireEvent.click(within(rows[1]).getByText('Encerrar'))

    expect(handleClose).toHaveBeenCalledWith('offer-1')

    spy.mockRestore()
  })

  it('clique em "Nova oferta" chama handleOpenModal', () => {
    const handleOpenModal = vi.fn()
    const spy = mockUseMerchantDashboard({ handleOpenModal })

    renderWithStore(<MerchantDashboard />)
    fireEvent.click(screen.getByText('Nova oferta'))

    expect(handleOpenModal).toHaveBeenCalledTimes(1)

    spy.mockRestore()
  })

  it('modal aberto renderiza os campos do formulário de criação', () => {
    const spy = mockUseMerchantDashboard({ isModalOpen: true })

    renderWithStore(<MerchantDashboard />)

    expect(screen.getByLabelText('Título')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição')).toBeInTheDocument()
    expect(screen.getByLabelText('Desconto (%)')).toBeInTheDocument()
    expect(screen.getByLabelText('Estoque')).toBeInTheDocument()
    expect(screen.getByLabelText('Válida até')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar oferta' })).toBeInTheDocument()

    spy.mockRestore()
  })
})
