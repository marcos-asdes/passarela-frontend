import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/AuthCard'
import { RegisterForm } from '@/components/RegisterForm'
import { useSellerRegister } from '@/pages/SellerRegister/useSellerRegister'
import { UserRole } from '@/store/reducers/auth/types'

/** Cadastro de lojista — mesmo endpoint de registro do cliente, `role` fixo em `seller`. */
function SellerRegister(): ReactNode {
  const { handleSuccess } = useSellerRegister()

  return (
    <AuthCard
      title="Torne-se um lojista"
      subtitle="Crie a conta da sua loja para começar a publicar ofertas relâmpago."
      footer={
        <>
          Já tem uma conta? <Link to="/lojista/entrar">Entrar</Link>
        </>
      }
    >
      <RegisterForm role={UserRole.Seller} onSuccess={handleSuccess} />
    </AuthCard>
  )
}

export default SellerRegister
