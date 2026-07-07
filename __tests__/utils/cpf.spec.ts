/**
 * Testes unitários para isValidCPF
 *
 * Cenários testados:
 * - aceita um CPF válido sem máscara
 * - aceita um CPF válido com máscara
 * - rejeita CPF com dígito verificador incorreto
 * - rejeita CPF com todos os dígitos iguais
 * - rejeita CPF com tamanho diferente de 11 dígitos
 */

import { describe, expect, it } from 'vitest'

import { isValidCPF } from '@/utils/cpf'

describe('isValidCPF', () => {
  it('aceita um CPF válido sem máscara', () => {
    expect(isValidCPF('52998224725')).toBe(true)
  })

  it('aceita um CPF válido com máscara', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true)
  })

  it('rejeita CPF com dígito verificador incorreto', () => {
    expect(isValidCPF('52998224726')).toBe(false)
  })

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(isValidCPF('11111111111')).toBe(false)
  })

  it('rejeita CPF com tamanho diferente de 11 dígitos', () => {
    expect(isValidCPF('1234567890')).toBe(false)
  })
})
