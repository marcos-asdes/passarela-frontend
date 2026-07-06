import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import type { UsePersonaCardReturn } from '@/components/PersonaCard/types'

/** Handlers de navegação do card de persona — login e cadastro apontam pras rotas recebidas via props. */
export function usePersonaCard(loginTo: string, registerTo: string): UsePersonaCardReturn {
  const navigate = useNavigate()

  const handleLoginClick = useCallback((): void => {
    navigate(loginTo)
  }, [navigate, loginTo])

  const handleRegisterClick = useCallback((): void => {
    navigate(registerTo)
  }, [navigate, registerTo])

  return { handleLoginClick, handleRegisterClick }
}
