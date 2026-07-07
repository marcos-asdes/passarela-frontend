import axios from 'axios'

import { axiosApi } from '@/services/api/axiosApi'
import { API_OFFERS_ROUTES } from '@/services/apiRoutes/offers'
import { UserRole } from '@/store/reducers/auth/types'
import type { CreateOfferPayload, IMerchantOffer, IOffer, OfferStatus } from '@/store/reducers/offers/types'
import { createThunk } from '@/utils/redux/createThunk'

/** Traduz status HTTP em mensagem específica — o `AllExceptionsFilter` do backend só devolve genéricas por status. */
function mapOfferError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) return 'Você não tem permissão sobre essa oferta.'
    if (error.response?.status === 404) return 'Oferta não encontrada.'
    if (error.response?.status === 409) return 'Essa oferta não pode mais ser editada/encerrada.'
  }
  return 'Algo deu errado. Tente novamente.'
}

/** Dashboard do merchant: suas offers, cada uma com a contagem de interest. */
export const fetchMyOffersThunk = createThunk<IMerchantOffer[], void>('offers/fetchMine', async () => {
  try {
    const response = await axiosApi.get<IMerchantOffer[]>(API_OFFERS_ROUTES.get.mine, { role: UserRole.Merchant })
    return response.data
  } catch (error) {
    throw new Error(mapOfferError(error), { cause: error })
  }
})

/** Publica uma nova offer. */
export const createOfferThunk = createThunk<IOffer, CreateOfferPayload>('offers/create', async (payload) => {
  try {
    const response = await axiosApi.post<IOffer>(API_OFFERS_ROUTES.post.create, payload, { role: UserRole.Merchant })
    return response.data
  } catch (error) {
    throw new Error(mapOfferError(error), { cause: error })
  }
})

/** Encerra manualmente uma offer própria. */
export const closeOfferThunk = createThunk<IOffer, string>('offers/close', async (offerId) => {
  try {
    const response = await axiosApi.post<IOffer>(API_OFFERS_ROUTES.post.close(offerId), undefined, {
      role: UserRole.Merchant
    })
    return response.data
  } catch (error) {
    throw new Error(mapOfferError(error), { cause: error })
  }
})

/** Feed público — sem autenticação, default só offers Active. */
export const fetchPublicOffersThunk = createThunk<IOffer[], OfferStatus | void>(
  'offers/fetchPublic',
  async (status) => {
    try {
      const response = await axiosApi.get<IOffer[]>(API_OFFERS_ROUTES.get.public, { params: { status } })
      return response.data
    } catch (error) {
      throw new Error(mapOfferError(error), { cause: error })
    }
  }
)
