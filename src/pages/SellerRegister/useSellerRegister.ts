import { App } from 'antd'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import type { UseSellerRegisterReturn } from '@/pages/SellerRegister/types'

/** Pós-cadastro do lojista: avisa e redireciona pro login — backend não emite token no registro. */
export function useSellerRegister(): UseSellerRegisterReturn {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const handleSuccess = useCallback((): void => {
    message.success('Conta criada. Faça login para continuar.')
    navigate('/lojista/entrar')
  }, [message, navigate])

  return { handleSuccess }
}
