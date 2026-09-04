import { calculateDecay } from './decay'

describe('calculateDecay', () => {
  const ambient = { temperatureC: 32, transitHours: 24, transportMode: 'ambient-truck' as const }

  it('loses more modeled nutrient availability at higher temperature', () => {
    const cool = calculateDecay('Vitamin C', { ...ambient, temperatureC: 20 })
    const hot = calculateDecay('Vitamin C', ambient)
    expect(cool.status).toBe('available')
    expect(hot.status).toBe('available')
    if (cool.status === 'available' && hot.status === 'available') {
      expect(hot.value.remainingPercent).toBeLessThan(cool.value.remainingPercent)
    }
  })

  it('applies the cold-chain nutrient-loss modifier', () => {
    const ambientResult = calculateDecay('Vitamin C', ambient)
    const coldResult = calculateDecay('Vitamin C', { ...ambient, transportMode: 'cold-chain-reefer' })
    expect(ambientResult.status).toBe('available')
    expect(coldResult.status).toBe('available')
    if (ambientResult.status === 'available' && coldResult.status === 'available') {
      expect(coldResult.value.lostPercent).toBeLessThan(ambientResult.value.lostPercent)
    }
  })

  it('does not model missing vitamin values', () => {
    expect(calculateDecay(undefined, ambient)).toMatchObject({ status: 'unavailable' })
  })
})
