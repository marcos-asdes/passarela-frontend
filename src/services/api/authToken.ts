/**
 * Holder do access token em memória, fora do grafo de módulos do Redux — `axiosApi` é importado
 * pelos `thunk.ts` de dentro do store, então o interceptor não pode importar `@/store` de volta
 * (ciclo de módulos ES quebra em runtime: "Cannot access 'X' before initialization"). `store/index.ts`
 * sincroniza este valor via `store.subscribe(...)`.
 */
let accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}
