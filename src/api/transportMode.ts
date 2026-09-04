import type { ProductFacts } from '../types/product'
import type { TransportMode } from '../types/scenario'

export async function estimateTransportMode(product: ProductFacts, origin: string, destination: string, signal?: AbortSignal): Promise<Extract<TransportMode, 'road' | 'air' | 'sea'>> {
  const response = await fetch('/api/gemini/transport-mode', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ product: product.name, brand: product.brands?.join(', '), origin, destination }) })
  if (!response.ok) return 'road'
  const result = await response.json() as { mode?: 'road' | 'air' | 'sea' }
  return result.mode || 'road'
}
