import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/AuthCard'
import { LoginForm } from '@/components/LoginForm'
import { UserRole } from '@/store/reducers/auth/types'

/** Login do lojista — mesmo endpoint de login do cliente, papel conferido após a resposta do backend. */
function MerchantLogin(): ReactNode {
  return (
    <AuthCard
      title="Login do lojista"
      subtitle="Acesse sua loja para gerenciar ofertas relâmpago."
      footer={
        <>
          Ainda não é lojista? <Link to="/lojista/cadastro">Criar conta</Link>
        </>
      }
    >
      <LoginForm role={UserRole.Merchant} otherRoleLoginPath="/cliente/entrar" />
    </AuthCard>
  )
}

export default MerchantLogin
