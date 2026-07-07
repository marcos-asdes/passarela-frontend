import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import type { RequireRoleProps } from '@/routes/RequireRole/types'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectLoginUser } from '@/store/reducers/auth/slice'

/** Guard de rota: exige sessão autenticada no papel esperado, senão redireciona pra `/`. */
export function RequireRole({ role, children }: Readonly<RequireRoleProps>): ReactNode {
  const user = useAppSelector(selectLoginUser(role))

  if (!user) return <Navigate to="/" replace />

  return children
}
