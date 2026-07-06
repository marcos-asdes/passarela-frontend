/** Corpo de `POST /interest`. */
export interface RegisterInterestPayload {
  offerId: string
}

/** Resultado de `registerInterestThunk` — carrega o `offerId` de volta pra marcar como registrado no state. */
export interface RegisterInterestResult {
  offerId: string
  interestId: string
}

/** Um item devolvido por `GET /interest/mine`. */
export interface MyInterestItem {
  id: string
  offerId: string
}

/** Estado do reducer `interest`. */
export interface InterestState {
  fetchLoading: boolean
  /** Ids das offers em processamento (registro OU remoção) — usado pra loading por card, evita race condition. */
  pendingOfferIds: string[]
  error: string | null
  /** Mapa offerId → interestId das offers em que o shopper já registrou interesse. */
  registeredInterests: Record<string, string>
}
