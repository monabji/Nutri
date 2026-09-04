import { describe, expect, it } from 'vitest'
import { findMissingFields, normalizeProduct } from './normalizeProduct'

describe('Open Food Facts normalizer', () => {
  it('normalizes a complete product record without inventing fields', () => {
    const product = normalizeProduct({
      code: '8906009532363', product_name: 'Protein Bar', brands: 'Brand One, Brand Two', nova_group: 4,
      ecoscore_grade: 'b', ingredients_text: 'Oats', additives_tags: ['en:e322'], packaging_tags: ['en:plastic'],
      origins: 'India', quantity: '0.05 kg', nutriments: { 'energy-kcal_100g': 380, proteins_100g: 20 },
    }, '8906009532363')
    expect(product).toMatchObject({ barcode: '8906009532363', name: 'Protein Bar', brands: ['Brand One', 'Brand Two'], novaGroup: 4, ecoScore: 'B', quantityGrams: 50 })
    expect(product.nutrients.Energy).toEqual({ value: 380, unit: 'kcal/100g' })
    expect(findMissingFields(product)).toEqual([])
  })

  it('keeps absent values absent and reports them as missing', () => {
    const product = normalizeProduct({ code: '8906009532363', product_name: 'Sparse product' }, '8906009532363')
    expect(product.ingredientsText).toBeUndefined()
    expect(product.nutrients).toEqual({})
    expect(findMissingFields(product)).toContain('Ingredients')
    expect(findMissingFields(product)).toContain('Quantity')
    expect(findMissingFields(product)).toContain('Nutrition')
  })

  it('uses structured packaging in either documented response shape and validates source NOVA ranges', () => {
    const product = normalizeProduct({ code: '8906009532363', nova_group: 0, packaging: [{ material: 'en:plastic', shape: 'en:bottle' }] }, '8906009532363')
    expect(product.novaGroup).toBeUndefined()
    expect(product.packaging).toEqual([{ label: 'plastic · bottle' }])
    expect(normalizeProduct({ code: '8906009532363', packaging: { material: 'en:glass' } }, '8906009532363').packaging).toEqual([{ label: 'glass' }])
  })
})
