import type { Availability, Coordinate, ResolvedRoute, RouteWeather } from '../types/scenario'

type NominatimResult = { lat?: string; lon?: string; display_name?: string }
type OsrmRoute = { distance?: number; duration?: number; geometry?: { coordinates?: [number, number][] } }
type OpenMeteoResult = { current?: { temperature_2m?: number; time?: string } }

export type AutomaticOrigin = {
  query: string
  kind: 'manufacturing-place' | 'country-proxy'
}

const nominatimCache = new Map<string, Coordinate | undefined>()
let nominatimChain = Promise.resolve()
let lastNominatimRequestAt = 0

function wait(ms: number) { return new Promise((resolve) => window.setTimeout(resolve, ms)) }

async function requestNominatim(url: string, signal?: AbortSignal) {
  const previous = nominatimChain
  let release: () => void = () => undefined
  nominatimChain = new Promise<void>((resolve) => { release = resolve })
  await previous
  try {
    const pause = Math.max(0, 1_100 - (Date.now() - lastNominatimRequestAt))
    if (pause) await wait(pause)
    lastNominatimRequestAt = Date.now()
    return await fetch(url, { signal, headers: { Accept: 'application/json' } })
  } finally { release() }
}

export async function geocodePlace(query: string, signal?: AbortSignal): Promise<Coordinate | undefined> {
  const key = query.trim().toLowerCase()
  if (!key) return undefined
  if (nominatimCache.has(key)) return nominatimCache.get(key)
  const response = await requestNominatim(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, signal)
  if (!response.ok) throw new Error(`Geocoding request failed (${response.status}).`)
  const data: unknown = await response.json()
  const first = Array.isArray(data) ? data[0] as NominatimResult | undefined : undefined
  const latitude = Number(first?.lat); const longitude = Number(first?.lon)
  const resolved = Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude, label: first?.display_name || query } : undefined
  nominatimCache.set(key, resolved)
  return resolved
}

function getDeviceLocation(signal?: AbortSignal): Promise<Coordinate> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) { reject(new Error('Device location is not available in this browser.')); return }
    const onAbort = () => reject(new DOMException('Location request cancelled.', 'AbortError'))
    signal?.addEventListener('abort', onAbort, { once: true })
    navigator.geolocation.getCurrentPosition(
      (position) => { signal?.removeEventListener('abort', onAbort); resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'Your device location' }) },
      () => { signal?.removeEventListener('abort', onAbort); reject(new Error('Location permission is needed to automatically resolve the destination.')) },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    )
  })
}

async function getDrivingRoute(origin: Coordinate, destination: Coordinate, signal?: AbortSignal) {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`, { signal })
  if (!response.ok) throw new Error(`Routing request failed (${response.status}).`)
  const payload = await response.json() as { code?: string; routes?: OsrmRoute[] }
  const route = payload.code === 'Ok' ? payload.routes?.[0] : undefined
  if (!route || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) throw new Error('No drivable route was returned.')
  const path = route.geometry?.coordinates?.map(([longitude, latitude]) => [latitude, longitude] as [number, number])
  return { path, distanceKm: route.distance! / 1_000, durationHours: route.duration! / 3_600 }
}

function samplePath(path: [number, number][]) {
  const count = Math.min(5, path.length)
  return Array.from({ length: count }, (_, index) => path[Math.round(index * (path.length - 1) / Math.max(1, count - 1))])
}

async function getRouteWeather(path: [number, number][], signal?: AbortSignal): Promise<RouteWeather | undefined> {
  const samples = samplePath(path)
  if (!samples.length) return undefined
  const latitude = samples.map(([lat]) => lat).join(',')
  const longitude = samples.map(([, lon]) => lon).join(',')
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`, { signal })
  if (!response.ok) return undefined
  const payload: unknown = await response.json()
  const records = (Array.isArray(payload) ? payload : [payload]) as OpenMeteoResult[]
  const values = records.map((record) => Number(record.current?.temperature_2m)).filter(Number.isFinite)
  if (!values.length) return undefined
  return { averageTemperatureC: values.reduce((sum, value) => sum + value, 0) / values.length, minimumTemperatureC: Math.min(...values), maximumTemperatureC: Math.max(...values), sampleCount: values.length, observedAt: records[0]?.current?.time }
}

export async function resolveAutomaticRoute(originInput: AutomaticOrigin | undefined, signal?: AbortSignal): Promise<Availability<ResolvedRoute>> {
  if (!originInput) return { status: 'unavailable', reason: 'Open Food Facts does not report a manufacturing place or country that can be used as a route origin.' }
  try {
    const [origin, destination] = await Promise.all([geocodePlace(originInput.query, signal), getDeviceLocation(signal)])
    if (!origin) return { status: 'unavailable', reason: `The source-reported ${originInput.kind === 'manufacturing-place' ? 'manufacturing place' : 'country'} could not be located.` }
    const driving = await getDrivingRoute(origin, destination, signal)
    const path = driving.path?.length ? driving.path : [[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]] as [number, number][]
    const weather = await getRouteWeather(path, signal)
    return { status: 'available', value: { origin, destination, ...driving, path, weather, routingKind: 'driving', originKind: originInput.kind } }
  } catch (error) {
    if (signal?.aborted) throw error
    return { status: 'unavailable', reason: error instanceof Error ? error.message : 'The automatic route could not be resolved right now.' }
  }
}

export async function resolveRoute(origin?: string, destination?: string, signal?: AbortSignal): Promise<Availability<ResolvedRoute>> {
  if (!origin?.trim() || !destination?.trim()) return { status: 'unavailable', reason: 'Add both an origin and destination to display a route scenario.' }
  try {
    const [resolvedOrigin, resolvedDestination] = await Promise.all([geocodePlace(origin, signal), geocodePlace(destination, signal)])
    if (!resolvedOrigin || !resolvedDestination) return { status: 'unavailable', reason: 'One or both places could not be located. Try a more specific place name.' }
    return { status: 'available', value: { origin: resolvedOrigin, destination: resolvedDestination, routingKind: 'direct-line' } }
  } catch { return { status: 'unavailable', reason: 'The route places could not be located right now.' } }
}
