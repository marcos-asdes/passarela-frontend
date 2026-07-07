import type { UserRole } from '@/store/reducers/auth/types'

/** Retorno de `useAppHeader` — dados de exibição (nome/e-mail/carrinho) e comportamento (scroll, logout). */
export interface UseAppHeaderReturn {
  visible: boolean
  name: string | null
  email: string | null
  cartCount: number
  handleLogout: () => Promise<void>
}

/**
 * Props fornecidas pela página hospedeira — `AppHeader` não sabe o que "atualizar" significa pra
 * cada página, só repassa o clique. Callbacks sem prop: o botão/logo correspondente não reage.
 */
export interface AppHeaderProps {
  /** Papel da página hospedeira — cada página só existe atrás de `RequireRole` de um papel fixo,
   * então determina de qual sessão ler nome/e-mail/token e qual token derrubar no logout. */
  role: UserRole
  /** Clique no logo "Passarela" — reload suave (refetch) da página atual, sem recarregar o browser. */
  onLogoClick?: () => void
  /** Clique no ícone de carrinho — só o shopper renderiza o botão. */
  onCartClick?: () => void
  /** `true` quando o feed do shopper está filtrado só pros itens com interesse registrado. */
  cartFilterActive?: boolean
}
