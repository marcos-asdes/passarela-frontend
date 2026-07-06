import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { AuthCard } from '@/components/AuthCard'
import { RegisterForm } from '@/components/RegisterForm'
import { useMerchantRegister } from '@/pages/MerchantRegister/useMerchantRegister'
import { UserRole } from '@/store/reducers/auth/types'

/** Cadastro de lojista — mesmo endpoint de registro do cliente, `role` fixo em `merchant`. */
function MerchantRegister(): ReactNode {
  const { handleSuccess } = useMerchantRegister()

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
      <RegisterForm role={UserRole.Merchant} onSuccess={handleSuccess} />
    </AuthCard>
  )
}

export default MerchantRegister
