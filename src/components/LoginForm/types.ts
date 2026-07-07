import type { UserRole } from '@/store/reducers/auth/types'

/** Valores do formulário de login. */
export interface LoginFormValues {
  email: string
  password: string
}

/** Props do formulário de login compartilhado por lojista e cliente. */
export interface LoginFormProps {
  /** Papel desta página — enviado no payload do login, backend só busca conta daquele papel. */
  role: UserRole
}

/** Retorno de `useLoginForm`. */
export interface UseLoginFormReturn {
  loading: boolean
  error: string | null
  loggedIn: boolean
  handleSubmit: (values: LoginFormValues) => Promise<void>
}
