/** Papéis suportados no cadastro — espelha o enum `UserRole` do `backend/` (auth/domain/types.ts). */
export const UserRole = {
  Merchant: 'merchant',
  Shopper: 'shopper'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

/** Corpo de `POST /auth/register` — mesmo shape do `RegisterDto` do backend. */
export interface RegisterPayload {
  name: string
  email: string
  cpf: string
  phone: string
  birthDate: Date
  password: string
  confirmPassword: string
  role: UserRole
}

/** Corpo de resposta de `POST /auth/register` — só confirmação, sem token. */
export interface RegisterResponse {
  message: string
}

/** Corpo de `POST /auth/login`. */
export interface LoginPayload {
  email: string
  password: string
}

/** Usuário autenticado devolvido pelo login — mesmo recorte do backend (id + role, nunca dado pessoal). */
export interface AuthUser {
  id: string
  role: UserRole
}

/** Corpo de resposta de `POST /auth/login`. */
export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

/** Estado do reducer `auth`: `register` e `login` tratados de forma independente. */
export interface AuthState {
  register: {
    loading: boolean
    error: string | null
    success: boolean
  }
  login: {
    loading: boolean
    error: string | null
    accessToken: string | null
    user: AuthUser | null
  }
}
