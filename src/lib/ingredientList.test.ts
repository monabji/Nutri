import { describe, expect, it } from 'vitest'
import { splitIngredients } from './ingredientList'

describe('splitIngredients', () => {
  it('accepts commas, semicolons, and new lines together', () => {
    expect(splitIngredients('Sugar, salt; citric acid\n• tartrazine')).toEqual(['Sugar', 'salt', 'citric acid', 'tartrazine'])
  })

  it('removes blank entries and surrounding whitespace', () => {
    expect(splitIngredients('  sugar, ;\n salt  ')).toEqual(['sugar', 'salt'])
  })
})
