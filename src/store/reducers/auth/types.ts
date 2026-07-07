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

/** Corpo de `POST /auth/login` — role obrigatório: um mesmo e-mail pode ter conta merchant e conta shopper. */
export interface LoginPayload {
  email: string
  password: string
  role: UserRole
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

/** Corpo de resposta de `GET /auth/me` — nome/e-mail nunca vêm junto do login, só desse endpoint dedicado. */
export interface ProfileResponse {
  name: string
  email: string
}

/** Sessão de login de um papel — merchant e shopper guardam a sua própria, nunca se sobrescrevem. */
export interface LoginSessionState {
  loading: boolean
  error: string | null
  accessToken: string | null
  user: AuthUser | null
}

/** Perfil (nome/e-mail) de um papel — mesmo motivo de `LoginSessionState`, um por role. */
export interface ProfileSessionState {
  loading: boolean
  error: string | null
  name: string | null
  email: string | null
}

/**
 * Estado do reducer `auth`: `register` é transiente de formulário (não precisa coexistir por
 * papel); `login`/`profile` são chaveados por `UserRole` — merchant e shopper podem estar
 * autenticados ao mesmo tempo, cada um com seu próprio token/perfil.
 */
export interface AuthState {
  register: {
    loading: boolean
    error: string | null
    success: boolean
  }
  login: Record<UserRole, LoginSessionState>
  profile: Record<UserRole, ProfileSessionState>
}
