import type { Availability, Coordinate, ResolvedRoute, RouteWeather } from '../types/scenario'
import { FIXED_DESTINATION } from '../config/route'

type NominatimResult = { lat?: string; lon?: string; display_name?: string }
type OsrmRoute = { distance?: number; duration?: number; geometry?: { coordinates?: [number, number][] } }
type OpenMeteoResult = { current?: { temperature_2m?: number; time?: string } }

export type AutomaticOrigin = {
  query: string
  kind: 'manufacturing-place' | 'country-proxy' | 'researched-source'
  sourceEvidence?: Array<{ title: string; url: string }>
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

export async function resolveAutomaticRoute(originInput: AutomaticOrigin | undefined, signal?: AbortSignal, mode: 'road' | 'air' | 'sea' = 'road'): Promise<Availability<ResolvedRoute>> {
  if (!originInput) return { status: 'unavailable', reason: 'Open Food Facts does not report a manufacturing place or country that can be used as a route origin.' }
  try {
    const [origin, destination] = await Promise.all([geocodePlace(originInput.query, signal), geocodePlace(FIXED_DESTINATION.query, signal)])
    if (!origin || !destination) return { status: 'unavailable', reason: `The ${!origin ? 'source-reported origin' : 'fixed Katpadi destination'} could not be located.` }
    const path = [[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]] as [number, number][]
    const radians = (value: number) => value * Math.PI / 180
    const a = Math.sin(radians(destination.latitude - origin.latitude) / 2) ** 2 + Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) * Math.sin(radians(destination.longitude - origin.longitude) / 2) ** 2
    const greatCircleKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const route = mode === 'road' ? await getDrivingRoute(origin, destination, signal) : { path, distanceKm: greatCircleKm, durationHours: greatCircleKm / (mode === 'air' ? 700 : 35) + (mode === 'air' ? 4 : 24) }
    const routePath = route.path?.length ? route.path : path
    const weather = await getRouteWeather(routePath, signal)
    return { status: 'available', value: { origin, destination: { ...destination, label: FIXED_DESTINATION.label }, ...route, path: routePath, weather, routingKind: mode === 'road' ? 'driving' : 'direct-line', originKind: originInput.kind, sourceEvidence: originInput.sourceEvidence } }
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
