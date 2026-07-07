import type { UserRole } from '@/store/reducers/auth/types'

/** Valores do formulário de cadastro. */
export interface RegisterFormValues {
  name: string
  email: string
  cpf: string
  phone: string
  /** Sempre no formato `DD/MM/YYYY`, aplicado por `formatBirthDate` enquanto o usuário digita. */
  birthDate: string
  password: string
  confirmPassword: string
}

/** Props do formulário de cadastro compartilhado por lojista e cliente. */
export interface RegisterFormProps {
  /** Papel fixo desta página — enviado ao backend, nunca escolhido pelo usuário no formulário. */
  role: UserRole
  /** Chamado após o cadastro ser criado — backend não emite token no registro, login é etapa separada. */
  onSuccess: () => void
}

/** Retorno de `useRegisterForm`. */
export interface UseRegisterFormReturn {
  loading: boolean
  error: string | null
  handleSubmit: (values: RegisterFormValues) => Promise<void>
}
