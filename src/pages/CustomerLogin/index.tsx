import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/AuthCard'
import { LoginForm } from '@/components/LoginForm'
import { UserRole } from '@/store/reducers/auth/types'

/** Login do cliente — mesmo endpoint de login do lojista, papel conferido após a resposta do backend. */
function CustomerLogin(): ReactNode {
  return (
    <AuthCard
      title="Login do cliente"
      subtitle="Entre para acompanhar ofertas relâmpago das suas lojas favoritas."
      footer={
        <>
          Ainda não tem conta? <Link to="/cliente/cadastro">Criar conta</Link>
        </>
      }
    >
      <LoginForm role={UserRole.Customer} otherRoleLoginPath="/lojista/entrar" />
    </AuthCard>
  )
}

export default CustomerLogin
