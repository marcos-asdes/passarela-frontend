import type { UserRole } from '@/store/reducers/auth/types'

/** Retorno de `useAppHeader` — dados de exibição (nome/e-mail/papel/carrinho) e comportamento (scroll, logout). */
export interface UseAppHeaderReturn {
  visible: boolean
  name: string | null
  email: string | null
  role: UserRole | null
  cartCount: number
  handleLogout: () => Promise<void>
}
