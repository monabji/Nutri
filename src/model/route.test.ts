import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveAutomaticRoute } from './route'

describe('automatic route resolution', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('uses a source-reported manufacturing place, device location, driving route, and route weather', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) => success({ coords: { latitude: 12.9716, longitude: 77.5946 } } as GeolocationPosition),
      },
    })
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('nominatim')) return Promise.resolve(new Response(JSON.stringify([{ lat: '17.3850', lon: '78.4867', display_name: 'Hyderabad, India' }])))
      if (url.includes('router.project-osrm.org')) return Promise.resolve(new Response(JSON.stringify({ code: 'Ok', routes: [{ distance: 575000, duration: 37800, geometry: { coordinates: [[78.4867, 17.385], [77.5946, 12.9716]] } }] })))
      return Promise.resolve(new Response(JSON.stringify([{ current: { temperature_2m: 31, time: '2026-09-04T12:00' } }, { current: { temperature_2m: 33, time: '2026-09-04T12:00' } }])))
    }))

    const result = await resolveAutomaticRoute({ query: 'Parle Agro Plant, Hyderabad', kind: 'manufacturing-place' })

    expect(result).toMatchObject({ status: 'available', value: { distanceKm: 575, durationHours: 10.5, routingKind: 'driving', weather: { averageTemperatureC: 32 } } })
  })

  it('does not infer a factory when Open Food Facts omits manufacturing data', async () => {
    await expect(resolveAutomaticRoute(undefined)).resolves.toEqual({ status: 'unavailable', reason: expect.stringContaining('does not report a manufacturing place') })
  })
})
