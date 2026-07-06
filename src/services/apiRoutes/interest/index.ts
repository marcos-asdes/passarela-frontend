/** Paths da API relacionados a interest, agrupados por verbo HTTP. */
export const API_INTEREST_ROUTES = {
  get: { mine: '/interest/mine' },
  post: { register: '/interest' },
  put: {},
  delete: { remove: (offerId: string): string => `/interest/${offerId}` },
  patch: {}
}
