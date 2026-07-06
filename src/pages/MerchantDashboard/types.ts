import type { Dayjs } from 'dayjs'

import type { IMerchantOffer } from '@/store/reducers/offers/types'

/** Valores do formulário de criação de offer. */
export interface CreateOfferFormValues {
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: Dayjs
}

/** Retorno de `useMerchantDashboard`. */
export interface UseMerchantDashboardReturn {
  loading: boolean
  error: string | null
  offers: IMerchantOffer[]
  isModalOpen: boolean
  createLoading: boolean
  createError: string | null
  closeLoading: boolean
  handleOpenModal: () => void
  handleCloseModal: () => void
  handleCreateSubmit: (values: CreateOfferFormValues) => Promise<void>
  handleClose: (offerId: string) => Promise<void>
  handleSoftReload: () => void
}
