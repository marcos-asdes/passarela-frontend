/** Paths da API relacionados a offers, agrupados por verbo HTTP. */
export const API_OFFERS_ROUTES = {
  get: { public: '/offers', mine: '/offers/mine' },
  post: { create: '/offers', close: (id: string): string => `/offers/${id}/close` },
  put: {},
  delete: {},
  patch: { update: (id: string): string => `/offers/${id}` }
}
