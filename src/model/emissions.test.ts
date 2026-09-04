import { calculateEmissions } from './emissions'

describe('calculateEmissions', () => {
  it('increases emissions with distance and cold-chain transport', () => {
    const ambient = calculateEmissions({ distanceKm: 100, massKg: 1, transportMode: 'ambient-truck' })
    const cold = calculateEmissions({ distanceKm: 100, massKg: 1, transportMode: 'cold-chain-reefer' })
    const longer = calculateEmissions({ distanceKm: 200, massKg: 1, transportMode: 'ambient-truck' })
    expect(ambient.status).toBe('available')
    expect(cold.status).toBe('available')
    expect(longer.status).toBe('available')
    if (ambient.status === 'available' && cold.status === 'available' && longer.status === 'available') {
      expect(cold.value.kgCo2e).toBeGreaterThan(ambient.value.kgCo2e)
      expect(longer.value.kgCo2e).toBeGreaterThan(ambient.value.kgCo2e)
    }
  })

  it('requires distance and mass', () => {
    expect(calculateEmissions({ transportMode: 'ambient-truck' })).toMatchObject({ status: 'unavailable' })
  })
})
