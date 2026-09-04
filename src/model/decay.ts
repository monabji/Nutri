import { modelConfig } from '../config/modelConfig'
import type { Availability, DecayResult, ScenarioInput } from '../types/scenario'

const round = (value: number, decimals = 1) => Number(value.toFixed(decimals))

function rateForScenario(input: Pick<ScenarioInput, 'temperatureC' | 'transportMode'>) {
  const temperatureMultiplier = Math.pow(
    modelConfig.q10,
    (input.temperatureC - modelConfig.referenceTemperatureC) / 10,
  )
  const coldChainMultiplier = input.transportMode === 'cold-chain-reefer'
    ? modelConfig.coldChainNutrientLossMultiplier
    : 1

  return modelConfig.baselineLossPerHour * temperatureMultiplier * coldChainMultiplier
}

function thresholdDate(ratePerHour: number, printedExpiryDate?: string) {
  if (!printedExpiryDate) return undefined
  const expiry = new Date(`${printedExpiryDate}T23:59:59`)
  if (Number.isNaN(expiry.getTime())) return undefined
  const thresholdHours = -Math.log(modelConfig.availabilityThresholdPercent / 100) / ratePerHour
  const modelledThreshold = new Date(Date.now() + thresholdHours * 60 * 60 * 1000)
  return new Date(Math.min(expiry.getTime(), modelledThreshold.getTime())).toISOString()
}

export function calculateDecay(
  nutrient: string | undefined,
  input: Pick<ScenarioInput, 'temperatureC' | 'transitHours' | 'transportMode' | 'printedExpiryDate'>,
): Availability<DecayResult> {
  if (!nutrient) {
    return {
      status: 'unavailable',
      reason: 'Open Food Facts does not report a Vitamin C or B-complex value for this product.',
    }
  }
  if (!Number.isFinite(input.temperatureC) || input.temperatureC < 15 || input.temperatureC > 42) {
    return { status: 'unavailable', reason: 'Enter a transit temperature between 15°C and 42°C.' }
  }
  if (!Number.isFinite(input.transitHours) || input.transitHours < 0 || input.transitHours > 48) {
    return { status: 'unavailable', reason: 'Enter a transit duration between 0 and 48 hours.' }
  }

  const ratePerHour = rateForScenario(input)
  const remainingAtHour = (hour: number) => 100 * Math.exp(-ratePerHour * hour)
  const remainingPercent = remainingAtHour(input.transitHours)
  const series = Array.from({ length: 49 }, (_, hour) => ({
    hour,
    remainingPercent: round(remainingAtHour(hour)),
  }))

  return {
    status: 'available',
    value: {
      nutrient,
      ratePerHour,
      remainingPercent: round(remainingPercent),
      lostPercent: round(100 - remainingPercent),
      series,
      thresholdDate: thresholdDate(ratePerHour, input.printedExpiryDate),
    },
  }
}
