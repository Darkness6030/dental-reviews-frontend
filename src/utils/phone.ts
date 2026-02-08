export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (!digits.startsWith('7')) {
    digits = '7' + digits.replace(/^7*/, '')
  }

  let formattedPhone = '+7'
  if (digits.length > 1) formattedPhone += ' ' + digits.slice(1, 4)
  if (digits.length > 4) formattedPhone += ' ' + digits.slice(4, 7)
  if (digits.length > 7) formattedPhone += ' ' + digits.slice(7, 9)
  if (digits.length > 9) formattedPhone += ' ' + digits.slice(9, 11)

  return formattedPhone
}