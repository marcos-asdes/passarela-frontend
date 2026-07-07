/**
 * Testes unitários para API_INTEREST_ROUTES
 *
 * Cenários testados:
 * - expõe os paths fixos de get/post
 * - delete.remove monta o path com o offerId informado
 */

import { describe, expect, it } from 'vitest'

import { API_INTEREST_ROUTES } from '@/services/apiRoutes/interest'

describe('API_INTEREST_ROUTES', () => {
  it('expõe os paths fixos de get/post', () => {
    expect(API_INTEREST_ROUTES.get.mine).toBe('/interest/mine')
    expect(API_INTEREST_ROUTES.post.register).toBe('/interest')
  })

  it('delete.remove monta o path com o offerId informado', () => {
    expect(API_INTEREST_ROUTES.delete.remove('offer-1')).toBe('/interest/offer-1')
  })
})
