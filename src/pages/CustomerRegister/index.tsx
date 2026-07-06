import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/AuthCard'
import { RegisterForm } from '@/components/RegisterForm'
import { useCustomerRegister } from '@/pages/CustomerRegister/useCustomerRegister'
import { UserRole } from '@/store/reducers/auth/types'

/** Cadastro de cliente — mesmo endpoint de registro do lojista, `role` fixo em `customer`. */
function CustomerRegister(): ReactNode {
  const { handleSuccess } = useCustomerRegister()

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
      <RegisterForm role={UserRole.Customer} onSuccess={handleSuccess} />
    </AuthCard>
  )
}

export default CustomerRegister
