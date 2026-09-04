import { describe, expect, it } from 'vitest'
import { isValidEan13, normalizeBarcode, validateBarcode } from './barcode'

describe('EAN-13 barcode validation', () => {
  it('normalizes spaces and hyphens', () => {
    expect(normalizeBarcode('8906 0095-32363')).toBe('8906009532363')
  })

  it('accepts documented valid codes and rejects invalid checksums', () => {
    expect(isValidEan13('8906009532363')).toBe(true)
    expect(isValidEan13('8906009532364')).toBe(false)
  })

  it('gives the Phase 2 validation result for malformed input', () => {
    expect(validateBarcode('abc')).toMatchObject({ valid: false, barcode: 'abc' })
    expect(validateBarcode('')).toMatchObject({ valid: false })
    expect(validateBarcode('123456789012')).toMatchObject({ valid: false })
    expect(validateBarcode('12345678901234')).toMatchObject({ valid: false })
  })
})
