import type { NutrientValue, ProductFacts } from '../types/product'

type EstimateResponse = { estimates?: Record<string, { value?: number }> ; error?: string }

const micronutrientKeys = [
  ['Vitamin C', 'vitamin_c_mg_per_100g', 'mg/100g'], ['Vitamin B1', 'vitamin_b1_mg_per_100g', 'mg/100g'],
  ['Vitamin B2', 'vitamin_b2_mg_per_100g', 'mg/100g'], ['Vitamin B6', 'vitamin_b6_mg_per_100g', 'mg/100g'],
  ['Vitamin B12', 'vitamin_b12_mg_per_100g', 'mg/100g'],
] as const

export async function estimateMissingMicronutrients(product: ProductFacts, signal?: AbortSignal) {
  const missing = micronutrientKeys.filter(([label]) => !product.nutrients[label])
  if (!missing.length) return {}
  const response = await fetch('/api/gemini/micronutrients', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal,
    body: JSON.stringify({ name: product.name, brand: product.brands?.join(', '), ingredients: product.ingredientsText, missing: missing.map(([label, key]) => ({ label, key })) }),
  })
  const payload = await response.json().catch(() => ({})) as EstimateResponse
  if (!response.ok) throw new Error(payload.error || 'Gemini could not estimate missing micronutrients.')
  return missing.reduce<Record<string, NutrientValue>>((result, [label, key, unit]) => {
    const value = Number(payload.estimates?.[key]?.value)
    if (Number.isFinite(value) && value >= 0) result[label] = { value, unit }
    return result
  }, {})
}
