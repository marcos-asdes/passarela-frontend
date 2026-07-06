import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/AuthCard'
import { RegisterForm } from '@/components/RegisterForm'
import { useShopperRegister } from '@/pages/ShopperRegister/useShopperRegister'
import { UserRole } from '@/store/reducers/auth/types'

/** Cadastro de cliente — mesmo endpoint de registro do lojista, `role` fixo em `shopper`. */
function ShopperRegister(): ReactNode {
  const { handleSuccess } = useShopperRegister()

  return (
    <AuthCard
      title="Crie sua conta"
      subtitle="Cadastre-se para acompanhar ofertas relâmpago das suas lojas favoritas."
      footer={
        <>
          Já tem uma conta? <Link to="/cliente/entrar">Entrar</Link>
        </>
      }
    >
      <RegisterForm role={UserRole.Shopper} onSuccess={handleSuccess} />
    </AuthCard>
  )
}

export default ShopperRegister
