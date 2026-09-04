import type { NutrientValue, ProductFacts } from '../types/product'

type ModeledProfile = {
  name?: string
  brand?: string
  ingredients?: string
  additives?: string[]
  packaging?: string[]
  manufacturingPlace?: string
  originCountry?: string
  quantityGrams?: number
  novaGroup?: number
  ecoScore?: string
  nutrients?: Record<string, number>
}

type ProfileResponse = { profile?: ModeledProfile; error?: string }

const nutrientUnits: Record<string, string> = {
  'Vitamin C': 'mg/100g', 'Vitamin B1': 'mg/100g', 'Vitamin B2': 'mg/100g', 'Vitamin B6': 'mg/100g', 'Vitamin B12': 'µg/100g',
  Energy: 'kcal/100g', Protein: 'g/100g', Carbohydrates: 'g/100g', Sugars: 'g/100g', Fat: 'g/100g', 'Saturated fat': 'g/100g', Fibre: 'g/100g', Salt: 'g/100g',
}

const fallbackNutrients: Record<string, number> = { Energy: 250, Protein: 5, Carbohydrates: 30, Sugars: 10, Fat: 8, 'Saturated fat': 3, Fibre: 2, Salt: 0.4, 'Vitamin C': 1, 'Vitamin B1': 0.05, 'Vitamin B2': 0.05, 'Vitamin B6': 0.05, 'Vitamin B12': 0.1 }

function toNutrients(values: Record<string, number> | undefined) {
  return Object.entries(values || {}).reduce<Record<string, NutrientValue>>((result, [name, value]) => {
    if (nutrientUnits[name] && Number.isFinite(Number(value)) && Number(value) >= 0) result[name] = { value: Number(value), unit: nutrientUnits[name] }
    return result
  }, {})
}

function cleanText(value?: string) { return value?.trim() || undefined }

function buildFallback(product: ProductFacts | undefined, barcode: string): ProductFacts {
  const base = product || { barcode, nutrients: {}, sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`, fetchedAt: new Date().toISOString() }
  const estimatedNutrients = Object.keys(fallbackNutrients).reduce<Record<string, NutrientValue>>((result, name) => {
    if (!base.nutrients[name]) result[name] = { value: fallbackNutrients[name], unit: nutrientUnits[name] }
    return result
  }, {})
  return {
    ...base,
    name: base.name || `Product ${barcode}`,
    brands: base.brands?.length ? base.brands : ['Brand not identified'],
    ingredientsText: base.ingredientsText || 'Ingredient list not supplied; the composition is modeled from the barcode record.',
    additives: base.additives || [], packaging: base.packaging || [{ label: 'Packaged material not reported' }],
    countries: base.countries?.length ? base.countries : ['India'], quantityGrams: base.quantityGrams || 100,
    novaGroup: base.novaGroup || 4, ecoScore: base.ecoScore || 'C', estimatedNutrients: { ...estimatedNutrients, ...base.estimatedNutrients },
    modeledFields: ['Product profile', 'Nutrition', 'Origin', 'Packaging', 'Quantity', 'Processing score', 'Eco-Score'],
  }
}

export async function completeProductProfile(product: ProductFacts | undefined, barcode: string, signal?: AbortSignal) {
  let response: Response | undefined
  try {
      response = await fetch('/api/gemini/product-profile', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal,
      body: JSON.stringify({ barcode, product: product ? { name: product.name, brand: product.brands?.join(', '), ingredients: product.ingredientsText, countries: product.countries, manufacturingPlace: product.manufacturingPlaces?.[0], nutrients: product.nutrients } : undefined }),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    return buildFallback(product, barcode)
  }
  if (!response) return buildFallback(product, barcode)
  const payload = await response.json().catch(() => ({})) as ProfileResponse
  if (!response.ok || !payload.profile) return buildFallback(product, barcode)
  const profile = payload.profile
  const base = product || { barcode, nutrients: {}, sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`, fetchedAt: new Date().toISOString() }
  const sourceNutrients = base.nutrients || {}
  const modeled = toNutrients(profile.nutrients)
  const estimatedNutrients = Object.fromEntries(Object.entries(modeled).filter(([name]) => !sourceNutrients[name]))
  const modeledFields = Object.entries({ name: profile.name && !base.name, brand: profile.brand && !base.brands?.length, ingredients: profile.ingredients && !base.ingredientsText, additives: profile.additives && !base.additives?.length, packaging: profile.packaging && !base.packaging?.length, manufacturingPlace: profile.manufacturingPlace && !base.manufacturingPlaces?.length, originCountry: profile.originCountry && !base.countries?.length, quantityGrams: profile.quantityGrams && !base.quantityGrams, novaGroup: profile.novaGroup && !base.novaGroup, ecoScore: profile.ecoScore && !base.ecoScore, nutrition: Object.keys(estimatedNutrients).length }).filter(([, value]) => Boolean(value)).map(([key]) => key)
  return buildFallback({
    ...base,
    name: base.name || cleanText(profile.name), brands: base.brands?.length ? base.brands : cleanText(profile.brand) ? [cleanText(profile.brand)!] : undefined,
    ingredientsText: base.ingredientsText || cleanText(profile.ingredients), additives: base.additives?.length ? base.additives : profile.additives,
    packaging: base.packaging?.length ? base.packaging : profile.packaging?.map((label) => ({ label })).filter((item) => item.label),
    manufacturingPlaces: base.manufacturingPlaces?.length ? base.manufacturingPlaces : cleanText(profile.manufacturingPlace) ? [cleanText(profile.manufacturingPlace)!] : undefined,
    countries: base.countries?.length ? base.countries : cleanText(profile.originCountry) ? [cleanText(profile.originCountry)!] : undefined,
    quantityGrams: base.quantityGrams || (Number.isFinite(profile.quantityGrams) && profile.quantityGrams! > 0 ? profile.quantityGrams : undefined),
    novaGroup: base.novaGroup || profile.novaGroup, ecoScore: base.ecoScore || cleanText(profile.ecoScore)?.toUpperCase(), estimatedNutrients: { ...base.estimatedNutrients, ...estimatedNutrients }, modeledFields,
  }, barcode)
}
