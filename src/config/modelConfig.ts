import type { TransportMode } from '../types/scenario'

export const modelConfig = {
  version: '1.0',
  referenceTemperatureC: 20,
  q10: 2,
  baselineLossPerHour: 0.003,
  availabilityThresholdPercent: 70,
  coldChainNutrientLossMultiplier: 0.2,
  freightKgCo2ePerTonneKm: {
    'ambient-truck': 0.09,
    'cold-chain-reefer': 0.126,
  } satisfies Record<TransportMode, number>,
} as const

export const transportModeLabels: Record<TransportMode, string> = {
  'ambient-truck': 'Ambient truck',
  'cold-chain-reefer': 'Cold-chain reefer',
}
