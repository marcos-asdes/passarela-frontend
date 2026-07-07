import { UserRole } from '@/store/reducers/auth/types'

/**
 * Holder dos access tokens em memória, um por papel, fora do grafo de módulos do Redux —
 * `axiosApi` é importado pelos `thunk.ts` de dentro do store, então o interceptor não pode
 * importar `@/store` de volta (ciclo de módulos ES quebra em runtime: "Cannot access 'X' before
 * initialization"). `store/index.ts` sincroniza os dois valores via `store.subscribe(...)`.
 * Por papel (não um único slot) pra merchant e shopper poderem estar autenticados ao mesmo tempo
 * sem um token sobrescrever o outro.
 */
const accessTokens: Record<UserRole, string | null> = {
  [UserRole.Merchant]: null,
  [UserRole.Shopper]: null
}

export function setAccessToken(role: UserRole, token: string | null): void {
  accessTokens[role] = token
}

export function getAccessToken(role: UserRole): string | null {
  return accessTokens[role]
}
