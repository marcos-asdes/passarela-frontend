/** Status de uma offer — espelha o enum `OfferStatus` do `backend/` (offers/domain/types.ts). */
export const OfferStatus = {
  Active: 'active',
  Closed: 'closed',
  SoldOut: 'sold_out',
  Expired: 'expired'
} as const

export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus]

/** Uma offer — mesmo recorte de `OfferResponseDto` do backend. */
export interface IOffer {
  id: string
  merchantId: string
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: string
  status: OfferStatus
  createdAt: string
}

/** Uma offer no dashboard do merchant — inclui a contagem de interest. */
export interface IMerchantOffer extends IOffer {
  interestCount: number
}

/** Corpo de `POST /offers`. */
export interface CreateOfferPayload {
  title: string
  description: string
  discountPercent: number
  stock: number
  validUntil: string
}

/** Estado do reducer `offers`: `mine`, `create` e `public` tratados de forma independente. */
export interface OffersState {
  mine: {
    loading: boolean
    error: string | null
    items: IMerchantOffer[]
  }
  create: {
    loading: boolean
    error: string | null
  }
  close: {
    loading: boolean
    error: string | null
  }
  public: {
    loading: boolean
    error: string | null
    items: IOffer[]
  }
}
