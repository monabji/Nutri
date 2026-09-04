import { describe, expect, it } from 'vitest'
import { analyzeIngredients } from './ingredients'

describe('analyzeIngredients', () => {
  it('collects sugar aliases and additive codes from source fields and ingredient text', () => {
    expect(analyzeIngredients('Sugar, cocoa butter, E 322', ['e422'])).toEqual({
      sugarAliases: ['sugar'],
      additiveCodes: ['E422', 'E322'],
    })
  })

  it('returns empty signals when source ingredient fields are absent', () => {
    expect(analyzeIngredients()).toEqual({ sugarAliases: [], additiveCodes: [] })
  })
})
