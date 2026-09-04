export type TransportMode = 'road' | 'air' | 'sea' | 'ambient-truck' | 'cold-chain-reefer'

export type ScenarioInput = {
  temperatureC: number
  transitHours: number
  transportMode: TransportMode
  distanceKm?: number
  massKg?: number
  printedExpiryDate?: string
  origin?: string
  destination?: string
}

export type Availability<T> =
  | { status: 'available'; value: T }
  | { status: 'unavailable'; reason: string }

export type DecayPoint = {
  hour: number
  remainingPercent: number
}

export type DecayResult = {
  nutrient: string
  ratePerHour: number
  remainingPercent: number
  lostPercent: number
  series: DecayPoint[]
  thresholdDate?: string
}

export type EmissionsResult = {
  kgCo2e: number
  factorKgCo2ePerTonneKm: number
  modeLabel: string
}

export type IngredientAnalysis = {
  additiveCodes: string[]
  sugarAliases: string[]
}

export type Coordinate = {
  latitude: number
  longitude: number
  label: string
}

export type ResolvedRoute = {
  origin: Coordinate
  destination: Coordinate
  path?: [number, number][]
  distanceKm?: number
  durationHours?: number
  weather?: RouteWeather
  routingKind?: 'direct-line' | 'driving'
  originKind?: 'manufacturing-place' | 'country-proxy' | 'researched-source'
  sourceEvidence?: Array<{ title: string; url: string }>
}

export type RouteWeather = {
  averageTemperatureC: number
  minimumTemperatureC: number
  maximumTemperatureC: number
  sampleCount: number
  observedAt?: string
}
