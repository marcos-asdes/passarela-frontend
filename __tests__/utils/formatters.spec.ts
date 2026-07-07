/**
 * Testes unitários para os formatadores (onlyDigits, formatCPF, formatPhone, formatBirthDate)
 *
 * Cenários testados:
 * - onlyDigits: remove tudo que não é dígito
 * - formatCPF: aplica a máscara progressivamente conforme os dígitos disponíveis
 * - formatCPF: ignora dígitos além do 11º
 * - formatPhone: aplica máscara de celular (11 dígitos)
 * - formatPhone: aplica máscara de telefone fixo (10 dígitos)
 * - formatPhone: não fecha o parêntese do DDD antes de ter os 2 dígitos
 * - formatBirthDate: aplica a máscara `00/00/0000` progressivamente conforme os dígitos disponíveis
 * - formatBirthDate: ignora dígitos além do 8º
 */

import { describe, expect, it } from 'vitest'

import { formatBirthDate, formatCPF, formatPhone, onlyDigits } from '@/utils/formatters'

describe('onlyDigits', () => {
  it('remove tudo que não é dígito', () => {
    expect(onlyDigits('abc123-456')).toBe('123456')
  })
})

describe('formatCPF', () => {
  it('aplica a máscara progressivamente conforme os dígitos disponíveis', () => {
    expect(formatCPF('529')).toBe('529')
    expect(formatCPF('529982')).toBe('529.982')
    expect(formatCPF('529982247')).toBe('529.982.247')
    expect(formatCPF('52998224725')).toBe('529.982.247-25')
  })

  it('ignora dígitos além do 11º', () => {
    expect(formatCPF('529982247259999')).toBe('529.982.247-25')
  })
})

describe('formatPhone', () => {
  it('aplica máscara de celular (11 dígitos)', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('aplica máscara de telefone fixo (10 dígitos)', () => {
    expect(formatPhone('1132654321')).toBe('(11) 3265-4321')
  })

  it('não fecha o parêntese do DDD antes de ter os 2 dígitos', () => {
    expect(formatPhone('1')).toBe('(1')
  })
})

describe('formatBirthDate', () => {
  it('aplica a máscara progressivamente conforme os dígitos disponíveis', () => {
    expect(formatBirthDate('01')).toBe('01')
    expect(formatBirthDate('0101')).toBe('01/01')
    expect(formatBirthDate('01011990')).toBe('01/01/1990')
  })

  it('ignora dígitos além do 8º', () => {
    expect(formatBirthDate('010119909999')).toBe('01/01/1990')
  })
})
