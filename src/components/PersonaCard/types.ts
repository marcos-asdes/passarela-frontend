import type { ReactNode } from 'react'

/** Props do card de persona (lojista/cliente) exibido na landing page. */
export interface PersonaCardProps {
  icon: ReactNode
  title: string
  description: string
  loginTo: string
  registerTo: string
}

/** Retorno de `usePersonaCard`. */
export interface UsePersonaCardReturn {
  handleLoginClick: () => void
  handleRegisterClick: () => void
}
