import { normalizeProduct, productFields, type RawProduct } from './normalizeProduct'
import { isSupportedProductBarcode, normalizeBarcode } from '../lib/barcode'
import { getDemoProduct } from '../config/demoProducts'

const endpoint = 'https://world.openfoodfacts.org/api/v2/product'
const timeoutMs = 8_000

export class ProductNotFoundError extends Error {
  constructor() {
    super('This barcode was not found in Open Food Facts.')
  }
}

export class ProductDataError extends Error {
  constructor(message = 'Open Food Facts returned an unexpected product record.') {
    super(message)
  }
}

export async function fetchProduct(barcode: string, signal?: AbortSignal) {
  const normalizedBarcode = normalizeBarcode(barcode)
  if (!isSupportedProductBarcode(normalizedBarcode)) throw new ProductDataError('Enter an 8–14 digit product barcode.')
  const demoProduct = getDemoProduct(normalizedBarcode)
  if (demoProduct) return demoProduct
  const timeoutController = new AbortController()
  const timeout = window.setTimeout(() => timeoutController.abort(), timeoutMs)
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutController.signal]) : timeoutController.signal

  try {
    const url = `${endpoint}/${encodeURIComponent(normalizedBarcode)}.json?fields=${productFields.join(',')}`
    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, signal: combinedSignal })
    if (response.status === 404) throw new ProductNotFoundError()
    if (!response.ok) throw new ProductDataError(`Open Food Facts could not be reached (HTTP ${response.status}).`)

    const payload: unknown = await response.json()
    if (!payload || typeof payload !== 'object') throw new ProductDataError()
    const record = payload as { status?: number; product?: RawProduct }
    if (record.status === 0) throw new ProductNotFoundError()
    if (record.status !== 1 || !record.product || typeof record.product !== 'object') throw new ProductDataError()

    return normalizeProduct(record.product, normalizedBarcode)
  } catch (error) {
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new ProductDataError('The lookup timed out. Please try again.')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}
