import type { ProductFacts } from '../types/product'

export type ManufacturingSource = { name: string; location: string; evidence: Array<{ title: string; url: string }> }

export async function findManufacturingSource(product: ProductFacts, signal?: AbortSignal): Promise<ManufacturingSource | undefined> {
  if (product.manufacturingPlaces?.[0] || !product.countries?.length) return undefined
  const response = await fetch('/api/gemini/manufacturing-source', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ name: product.name, brand: product.brands?.join(', '), countries: product.countries, origins: product.origins }) })
  if (!response.ok) throw new Error('A manufacturing source could not be found for this product.')
  const result = await response.json() as { found?: boolean; name?: string; location?: string; evidence?: Array<{ title?: string; url?: string }> }
  if (!result.found || !result.location) return undefined
  return { name: result.name || result.location, location: result.location, evidence: (result.evidence || []).filter((item): item is { title: string; url: string } => Boolean(item.title && item.url)) }
}
