import { onlyDigits } from '@/utils/formatters'

const CPF_LENGTH = 11

/**
 * CPFs com todos os dígitos iguais (ex.: 111.111.111-11) passam na fórmula do dígito verificador,
 * mas são sabidamente inválidos — mesma checagem do backend (auth/domain/cpf.ts).
 */
function isRepeatedDigitsSequence(digits: string): boolean {
  return /^(\d)\1*$/.test(digits)
}

/** Calcula o dígito verificador de um CPF a partir dos 9 ou 10 primeiros dígitos. */
function calculateCheckDigit(digits: string, weightStart: number): number {
  let sum = 0
  for (let i = 0; i < digits.length; i++) sum += Number(digits[i]) * (weightStart - i)

  const remainder = (sum * 10) % 11
  return remainder === 10 || remainder === 11 ? 0 : remainder
}

/** Valida um CPF (com ou sem máscara) pelo mesmo algoritmo de dígito verificador usado no backend. */
export function isValidCPF(raw: string): boolean {
  const digits = onlyDigits(raw)
  if (digits.length !== CPF_LENGTH) return false
  if (isRepeatedDigitsSequence(digits)) return false

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), 10)
  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 9) + firstCheckDigit, 11)

  return digits === digits.slice(0, 9) + firstCheckDigit.toString() + secondCheckDigit.toString()
}
