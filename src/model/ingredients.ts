import type { IngredientAnalysis } from '../types/scenario'

const sugarAliases = [
  'sugar', 'glucose', 'fructose', 'sucrose', 'dextrose', 'maltose', 'corn syrup', 'rice syrup', 'malt syrup',
]

const additivePattern = /\bE\s?(\d{3,4}[a-z]?)\b/gi

export function analyzeIngredients(ingredientsText?: string, sourceAdditives?: string[]): IngredientAnalysis {
  const source = ingredientsText?.toLowerCase() || ''
  const sugars = sugarAliases.filter((alias) => source.includes(alias))
  const fromText = Array.from(source.matchAll(additivePattern), ([, code]) => `E${code.toUpperCase()}`)
  const fromSource = (sourceAdditives || []).map((code) => code.toUpperCase().replace(/^E?/, 'E'))

  return {
    sugarAliases: [...new Set(sugars)],
    additiveCodes: [...new Set([...fromSource, ...fromText])],
  }
}
