export type NutrientValue = {
  value: number
  unit: string
}

export type PackagingComponent = {
  label: string
}

export type ProductFacts = {
  barcode: string
  name?: string
  brands?: string[]
  novaGroup?: number
  ecoScore?: string
  ingredientsText?: string
  additives?: string[]
  packaging?: PackagingComponent[]
  manufacturingPlaces?: string[]
  origins?: string[]
  countries?: string[]
  quantityGrams?: number
  nutrients: Record<string, NutrientValue>
  sourceUrl: string
  fetchedAt: string
}

export type LookupState =
  | { status: 'idle' }
  | { status: 'loading'; barcode: string }
  | { status: 'success'; product: ProductFacts; missingFields: string[] }
  | { status: 'not-found'; barcode: string }
  | { status: 'error'; message: string; retryable: boolean }
