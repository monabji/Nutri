import { modelConfig, transportModeLabels } from '../config/modelConfig'
import type { Availability, EmissionsResult, ScenarioInput } from '../types/scenario'

export function calculateEmissions(
  input: Pick<ScenarioInput, 'distanceKm' | 'massKg' | 'transportMode'>,
): Availability<EmissionsResult> {
  if (!input.distanceKm || input.distanceKm <= 0) {
    return { status: 'unavailable', reason: 'Add a route distance to model freight emissions.' }
  }
  if (!input.massKg || input.massKg <= 0) {
    return { status: 'unavailable', reason: 'Add product mass to model freight emissions.' }
  }

  const factor = modelConfig.freightKgCo2ePerTonneKm[input.transportMode]
  return {
    status: 'available',
    value: {
      kgCo2e: Number((input.distanceKm * (input.massKg / 1000) * factor).toFixed(3)),
      factorKgCo2ePerTonneKm: factor,
      modeLabel: transportModeLabels[input.transportMode],
    },
  }
}
