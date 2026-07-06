import axios from 'axios'

import { axiosApi } from '@/services/api/axiosApi'
import { API_AUTH_ROUTES } from '@/services/apiRoutes/auth'
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from '@/store/reducers/auth/types'
import { createThunk } from '@/utils/redux/createThunk'

/**
 * O `AllExceptionsFilter` do backend só devolve mensagens genéricas por status HTTP (nunca detalhe
 * de campo) — aqui traduzimos o status pra uma mensagem mais específica exibida na UI.
 */
function mapRegisterError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) return 'Este e-mail ou CPF já está cadastrado.'
    if (error.response?.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.'
  }
  return 'Algo deu errado. Tente novamente.'
}

/** Mesma tradução de status HTTP que `mapRegisterError`, mas para as respostas específicas do login. */
function mapLoginError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return 'E-mail ou senha inválidos.'
    if (error.response?.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.'
  }
  return 'Algo deu errado. Tente novamente.'
}

/** Cria uma conta (merchant ou shopper) — não emite token, login é uma chamada separada. */
export const registerThunk = createThunk<RegisterResponse, RegisterPayload>('auth/register', async (payload) => {
  try {
    const response = await axiosApi.post<RegisterResponse>(API_AUTH_ROUTES.post.register, payload)
    return response.data
  } catch (error) {
    throw new Error(mapRegisterError(error), { cause: error })
  }
})

/** Autentica com e-mail/senha e devolve o JWT. */
export const loginThunk = createThunk<LoginResponse, LoginPayload>('auth/login', async (payload) => {
  try {
    const response = await axiosApi.post<LoginResponse>(API_AUTH_ROUTES.post.login, payload)
    return response.data
  } catch (error) {
    throw new Error(mapLoginError(error), { cause: error })
  }
})
