export function normalizeBarcode(value: string) {
  return value.replace(/[\s-]/g, '')
}

export function isValidEan13(value: string) {
  if (!/^\d{13}$/.test(value)) return false

  const sum = value
    .slice(0, 12)
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0)

  return (10 - (sum % 10)) % 10 === Number(value[12])
}

export function isSupportedProductBarcode(value: string) {
  return /^\d{8,14}$/.test(value)
}

export function validateBarcode(value: string) {
  const barcode = normalizeBarcode(value)
  return {
    barcode,
    valid: isSupportedProductBarcode(barcode),
    message: 'Enter an 8–14 digit product barcode.',
  }
}
