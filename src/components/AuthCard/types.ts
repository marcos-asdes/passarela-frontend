import type { ReactNode } from 'react'

/** Props do card de chrome compartilhado pelas páginas de login/cadastro. */
export interface AuthCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}
