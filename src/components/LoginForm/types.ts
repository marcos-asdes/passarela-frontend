import type { UserRole } from '@/store/reducers/auth/types'

/** Valores do formulário de login. */
export interface LoginFormValues {
  email: string
  password: string
}

/** Props do formulário de login compartilhado por lojista e cliente. */
export interface LoginFormProps {
  /** Papel esperado nesta página — o backend não recebe role no login, então conferimos a resposta contra ele. */
  role: UserRole
  /** Rota de login do outro papel, usada quando a conta autenticada não bate com `role`. */
  otherRoleLoginPath: string
}

/** Retorno de `useLoginForm`. */
export interface UseLoginFormReturn {
  loading: boolean
  error: string | null
  roleMismatch: boolean
  loggedIn: boolean
  handleSubmit: (values: LoginFormValues) => Promise<void>
}
