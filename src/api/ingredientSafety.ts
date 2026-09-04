export type IngredientSafetyFinding = {
  ingredient: string
  europeStatus: 'allowed' | 'restricted' | 'banned' | 'unclear'
  indiaStatus: 'allowed' | 'restricted' | 'unclear'
  ruleDifference: 'yes' | 'no'
  healthConcern: string
  note: string
}

export async function checkIngredientSafety(ingredients: string[], signal?: AbortSignal): Promise<IngredientSafetyFinding[]> {
  const response = await fetch('/api/gemini/ingredient-safety', { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal, body: JSON.stringify({ ingredients }) })
  const payload = await response.json().catch(() => ({})) as { findings?: IngredientSafetyFinding[]; error?: string }
  if (!response.ok) throw new Error(payload.error || 'Ingredient safety lookup failed.')
  return payload.findings || []
}
