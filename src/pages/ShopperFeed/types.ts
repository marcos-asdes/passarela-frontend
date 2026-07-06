import type { IOffer } from '@/store/reducers/offers/types'

/** Retorno de `useShopperFeed`. */
export interface UseShopperFeedReturn {
  loading: boolean
  error: string | null
  /** Slice da página atual (paginação client-side). */
  pagedOffers: IOffer[]
  totalOffers: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  /** Mapa offerId → interestId das offers com interesse registrado. */
  registeredInterests: Record<string, string>
  /** IDs de offers em processamento — loading por card individual. */
  pendingOfferIds: string[]
  /** `true` quando o feed está filtrado só pros itens com interesse registrado (toggle do carrinho). */
  showOnlyInterests: boolean
  handleRegisterInterest: (offerId: string) => Promise<void>
  handleRemoveInterest: (offerId: string) => Promise<void>
  handleToggleCartFilter: () => void
  handleSoftReload: () => void
}
