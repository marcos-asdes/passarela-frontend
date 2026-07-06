import axios from 'axios'

import { axiosApi } from '@/services/api/axiosApi'
import { API_INTEREST_ROUTES } from '@/services/apiRoutes/interest'
import type { MyInterestItem, RegisterInterestResult } from '@/store/reducers/interest/types'
import { createThunk } from '@/utils/redux/createThunk'

/** Traduz status HTTP em mensagem específica — o `AllExceptionsFilter` do backend só devolve genéricas por status. */
function mapRegisterInterestError(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 409)
    return 'Você já demonstrou interesse nessa oferta, ou ela ficou indisponível.'

  return 'Algo deu errado. Tente novamente.'
}

/** Shopper registra interest numa offer — 1 por shopper/offer, decrementa o estoque no backend. */
export const registerInterestThunk = createThunk<RegisterInterestResult, string>(
  'interest/register',
  async (offerId) => {
    try {
      const response = await axiosApi.post<{ id: string }>(API_INTEREST_ROUTES.post.register, { offerId })
      return { offerId, interestId: response.data.id }
    } catch (error) {
      throw new Error(mapRegisterInterestError(error), { cause: error })
    }
  }
)

/** Busca todos os interests do shopper autenticado — restaura estado no carregamento/F5 da página. */
export const fetchMyInterestsThunk = createThunk<MyInterestItem[], void>('interest/fetchMine', async () => {
  try {
    const response = await axiosApi.get<MyInterestItem[]>(API_INTEREST_ROUTES.get.mine)
    return response.data
  } catch (error) {
    throw new Error('Algo deu errado. Tente novamente.', { cause: error })
  }
})

/** Shopper remove o próprio interest e devolve 1 unidade ao estoque. Retorna o offerId para atualização de estado. */
export const removeInterestThunk = createThunk<string, string>('interest/remove', async (offerId) => {
  try {
    await axiosApi.delete(API_INTEREST_ROUTES.delete.remove(offerId))
    return offerId
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404)
      throw new Error('Interesse não encontrado.', { cause: error })
    throw new Error('Algo deu errado. Tente novamente.', { cause: error })
  }
})
