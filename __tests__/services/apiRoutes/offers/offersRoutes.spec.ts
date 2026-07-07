/**
 * Testes unitários para API_OFFERS_ROUTES
 *
 * Cenários testados:
 * - expõe os paths fixos de get/post
 * - post.close monta o path com o id informado
 * - patch.update monta o path com o id informado
 */

import { describe, expect, it } from 'vitest'

import { API_OFFERS_ROUTES } from '@/services/apiRoutes/offers'

describe('API_OFFERS_ROUTES', () => {
  it('expõe os paths fixos de get/post', () => {
    expect(API_OFFERS_ROUTES.get.public).toBe('/offers')
    expect(API_OFFERS_ROUTES.get.mine).toBe('/offers/mine')
    expect(API_OFFERS_ROUTES.post.create).toBe('/offers')
  })

  it('post.close monta o path com o id informado', () => {
    expect(API_OFFERS_ROUTES.post.close('offer-1')).toBe('/offers/offer-1/close')
  })

  it('patch.update monta o path com o id informado', () => {
    expect(API_OFFERS_ROUTES.patch.update('offer-1')).toBe('/offers/offer-1')
  })
})
