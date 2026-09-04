import type { PackagingComponent, ProductFacts } from '../types/product'

export const productFields = [
  'code',
  'product_name',
  'brands',
  'nova_group',
  'ecoscore_grade',
  'ingredients_text',
  'additives_tags',
  'packaging_tags',
  'origins',
  'countries',
  'quantity',
  'product_quantity',
  'product_quantity_unit',
  'packaging',
  'manufacturing_places',
  'nutriments',
] as const

type RawNutrient = Record<string, number | string | undefined>

export type RawProduct = {
  code?: string
  product_name?: string
  brands?: string
  nova_group?: number | string
  ecoscore_grade?: string
  ingredients_text?: string
  additives_tags?: string[]
  packaging_tags?: string[]
  packaging?: Array<{ material?: string; shape?: string; recycling?: string }> | { material?: string; shape?: string; recycling?: string }
  manufacturing_places?: string
  origins?: string
  countries?: string
  quantity?: string
  product_quantity?: number | string
  product_quantity_unit?: string
  nutriments?: RawNutrient
}

const nutrientDefinitions = [
  ['Energy', 'energy-kcal_100g', 'kcal/100g'],
  ['Protein', 'proteins_100g', 'g/100g'],
  ['Carbohydrates', 'carbohydrates_100g', 'g/100g'],
  ['Sugars', 'sugars_100g', 'g/100g'],
  ['Fat', 'fat_100g', 'g/100g'],
  ['Saturated fat', 'saturated-fat_100g', 'g/100g'],
  ['Fibre', 'fiber_100g', 'g/100g'],
  ['Salt', 'salt_100g', 'g/100g'],
  ['Vitamin C', 'vitamin-c_100g', 'mg/100g'],
  ['Vitamin B1', 'vitamin-b1_100g', 'mg/100g'],
  ['Vitamin B2', 'vitamin-b2_100g', 'mg/100g'],
  ['Vitamin B6', 'vitamin-b6_100g', 'mg/100g'],
  ['Vitamin B12', 'vitamin-b12_100g', 'µg/100g'],
] as const

function splitList(value?: string) {
  return value?.split(',').map((item) => item.trim()).filter(Boolean)
}

function quantityToGrams(product: RawProduct) {
  const numericQuantity = Number(product.product_quantity)
  const quantityUnit = product.product_quantity_unit?.toLowerCase()
  if (Number.isFinite(numericQuantity) && numericQuantity > 0 && quantityUnit) {
    if (quantityUnit === 'kg') return numericQuantity * 1000
    if (quantityUnit === 'mg') return numericQuantity / 1000
    if (quantityUnit === 'g') return numericQuantity
  }

  const match = product.quantity?.match(/([\d.]+)\s*(kg|g|mg)\b/i)
  if (!match) return undefined
  const value = Number(match[1])
  const unit = match[2].toLowerCase()
  if (!Number.isFinite(value)) return undefined
  if (unit === 'kg') return value * 1000
  if (unit === 'mg') return value / 1000
  return value
}

function tidyLabel(value?: string) {
  return value?.replace(/^[a-z]{2}:/, '').replaceAll('-', ' ').trim()
}

function normalizePackaging(tags?: string[], packaging?: RawProduct['packaging']): PackagingComponent[] | undefined {
  const components = Array.isArray(packaging) ? packaging : packaging ? [packaging] : []
  const structured = components.map((item) => [tidyLabel(item.material), tidyLabel(item.shape), tidyLabel(item.recycling)].filter(Boolean).join(' · ')).filter(Boolean)
  if (structured?.length) return structured.map((label) => ({ label }))
  const labels = tags?.map((tag) => tag.replace(/^en:/, '').replaceAll('-', ' ').trim()).filter(Boolean)
  return labels?.length ? labels.map((label) => ({ label })) : undefined
}

export function findMissingFields(product: ProductFacts) {
  const fields: Array<[string, unknown]> = [
    ['Product name', product.name],
    ['Brand', product.brands?.length],
    ['NOVA group', product.novaGroup],
    ['Eco-Score', product.ecoScore],
    ['Ingredients', product.ingredientsText],
    ['Additives', product.additives?.length],
    ['Packaging', product.packaging?.length],
    ['Origin or countries', product.origins?.length || product.countries?.length],
    ['Quantity', product.quantityGrams],
    ['Nutrition', Object.keys(product.nutrients).length],
  ]

  return fields.filter(([, value]) => value === undefined || value === 0 || value === '').map(([name]) => name)
}

export function normalizeProduct(raw: RawProduct, requestedBarcode: string): ProductFacts {
  const nutrients = nutrientDefinitions.reduce<ProductFacts['nutrients']>((result, [label, key, unit]) => {
    const value = Number(raw.nutriments?.[key])
    if (Number.isFinite(value)) result[label] = { value, unit }
    return result
  }, {})

  return {
    barcode: raw.code?.trim() || requestedBarcode,
    name: raw.product_name?.trim() || undefined,
    brands: splitList(raw.brands),
    novaGroup: Number.isInteger(Number(raw.nova_group)) && Number(raw.nova_group) >= 1 && Number(raw.nova_group) <= 4 ? Number(raw.nova_group) : undefined,
    ecoScore: raw.ecoscore_grade && raw.ecoscore_grade !== 'unknown' ? raw.ecoscore_grade.toUpperCase() : undefined,
    ingredientsText: raw.ingredients_text?.trim() || undefined,
    additives: raw.additives_tags?.map((tag) => tag.replace(/^en:/, '')).filter(Boolean),
    packaging: normalizePackaging(raw.packaging_tags, raw.packaging),
    manufacturingPlaces: raw.manufacturing_places?.trim() ? [raw.manufacturing_places.trim()] : undefined,
    origins: splitList(raw.origins),
    countries: splitList(raw.countries),
    quantityGrams: quantityToGrams(raw),
    nutrients,
    sourceUrl: `https://world.openfoodfacts.org/product/${raw.code?.trim() || requestedBarcode}`,
    fetchedAt: new Date().toISOString(),
  }
}
