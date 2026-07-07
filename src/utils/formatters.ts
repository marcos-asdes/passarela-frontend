/** Remove tudo que não for dígito de uma string. */
export function onlyDigits(raw: string): string {
  return raw.replace(/\D/g, '')
}

/** Aplica a máscara `000.000.000-00` progressivamente enquanto o usuário digita. */
export function formatCPF(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11)
  const part1 = digits.slice(0, 3)
  const part2 = digits.slice(3, 6)
  const part3 = digits.slice(6, 9)
  const part4 = digits.slice(9, 11)

  let result = part1
  if (part2) result += `.${part2}`
  if (part3) result += `.${part3}`
  if (part4) result += `-${part4}`
  return result
}

/** Aplica a máscara `(00) 00000-0000` (celular) ou `(00) 0000-0000` (fixo) progressivamente. */
export function formatPhone(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 11)
  const ddd = digits.slice(0, 2)
  const isMobile = digits.length > 10
  const firstPartLength = isMobile ? 5 : 4
  const firstPart = digits.slice(2, 2 + firstPartLength)
  const secondPart = digits.slice(2 + firstPartLength)

  let result = ddd ? `(${ddd}` : ''
  if (ddd.length === 2) result += ') '
  result += firstPart
  if (secondPart) result += `-${secondPart}`
  return result
}

/** Aplica a máscara `00/00/0000` progressivamente enquanto o usuário digita. */
export function formatBirthDate(raw: string): string {
  const digits = onlyDigits(raw).slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  let result = day
  if (month) result += `/${month}`
  if (year) result += `/${year}`
  return result
}
