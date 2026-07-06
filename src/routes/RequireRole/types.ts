import type { ReactNode } from 'react'

import type { UserRole } from '@/store/reducers/auth/types'

/** Props do guard de rota por papel. */
export interface RequireRoleProps {
  /** Papel exigido pra acessar a rota — sem sessão ou com papel diferente, redireciona pra `/`. */
  role: UserRole
  children: ReactNode
}
