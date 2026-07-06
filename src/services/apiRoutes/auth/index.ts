/** Paths da API relacionados a autenticação, agrupados por verbo HTTP. */
export const API_AUTH_ROUTES = {
  get: { me: '/auth/me' },
  post: { register: '/auth/register', login: '/auth/login', logout: '/auth/logout' },
  put: {},
  delete: {},
  patch: {}
}
