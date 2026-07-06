import { App } from 'antd'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import type { UseShopperRegisterReturn } from '@/pages/ShopperRegister/types'

/** Pós-cadastro do cliente: avisa e redireciona pro login — backend não emite token no registro. */
export function useShopperRegister(): UseShopperRegisterReturn {
  const navigate = useNavigate()
  const { message } = App.useApp()

  const handleSuccess = useCallback((): void => {
    message.success('Conta criada. Faça login para continuar.')
    navigate('/cliente/entrar')
  }, [message, navigate])

  return { handleSuccess }
}
