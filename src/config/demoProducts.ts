import type { ProductFacts } from '../types/product'
import type { ResolvedRoute } from '../types/scenario'

type DemoProduct = ProductFacts & { demoRoute: ResolvedRoute }

const destination = { latitude: 12.9818, longitude: 79.1368, label: 'Katpadi, Vellore' }

export const demoProducts: Record<string, DemoProduct> = {
  '8901719117183': {
    barcode: '8901719117183', name: 'Parle Hide & Seek Chocolate Chip Cookies', brands: ['Parle'], novaGroup: 4, ecoScore: 'D',
    ingredientsText: 'Refined wheat flour (maida), sugar, chocolate chips, edible vegetable fat, cocoa solids, refined palm oil, invert sugar syrup, raising agents (E503(ii), E500(ii)), iodised salt, emulsifiers (E322, E471, E472e), artificial vanilla flavour, sodium metabisulphite (E223), antioxidant (TBHQ).',
    additives: ['E322', 'E472e', 'E500', 'E503', 'E471', 'E223', 'TBHQ'], packaging: [{ label: 'Plastic wrapper' }],
    origins: ['India'], countries: ['India'], manufacturingPlaces: ['India'], quantityGrams: 100,
    nutrients: { Energy: { value: 474, unit: 'kcal/100g' }, Protein: { value: 6, unit: 'g/100g' }, Carbohydrates: { value: 74.2, unit: 'g/100g' }, Sugars: { value: 32.6, unit: 'g/100g' }, Fat: { value: 17, unit: 'g/100g' }, 'Saturated fat': { value: 11.2, unit: 'g/100g' }, Salt: { value: 0.3, unit: 'g/100g' } },
    estimatedNutrients: { 'Vitamin C': { value: 0.2, unit: 'mg/100g' }, 'Vitamin B1': { value: 0.05, unit: 'mg/100g' }, 'Vitamin B2': { value: 0.04, unit: 'mg/100g' }, 'Vitamin B6': { value: 0.04, unit: 'mg/100g' }, 'Vitamin B12': { value: 0.1, unit: 'µg/100g' } },
    modeledFields: ['Micronutrients', 'Manufacturing location', 'Transit conditions'], sourceUrl: 'https://world.openfoodfacts.org/product/8901719117183/hide-seek-parle', fetchedAt: '2026-09-04T00:00:00.000Z',
    demoRoute: { origin: { latitude: 22.9734, longitude: 78.6569, label: 'India (geographic proxy)' }, destination, path: [[22.9734, 78.6569], [12.9818, 79.1368]], distanceKm: 1296.3, durationHours: 26.5, weather: { averageTemperatureC: 31, minimumTemperatureC: 28, maximumTemperatureC: 34, sampleCount: 5, observedAt: '2026-09-04T12:00:00Z' }, routingKind: 'driving', originKind: 'country-proxy' },
  },
  '8901491100267': {
    barcode: '8901491100267', name: "Lay's India's Magic Masala Potato Chips", brands: ["Lay's"], novaGroup: 4, ecoScore: 'C',
    ingredientsText: 'Potatoes, edible vegetable oil, seasoning mix (sugar, iodised salt, spices and condiments, onion powder, mango powder, garlic powder, tomato powder), maltodextrin, acidity regulators, flavour enhancers, silicon dioxide, paprika extract.',
    additives: ['E551 (Silicon dioxide)', 'E627 (Disodium guanylate)', 'E631 (Disodium inosinate)', 'E330 (Citric acid)', 'E296 (Malic acid)', 'E334 (Tartaric acid)', 'E160c (Paprika extract)'], packaging: [{ label: 'Plastic bag' }],
    origins: ['India'], countries: ['India'], manufacturingPlaces: ['Kosi Kalan, Mathura, Uttar Pradesh, India'], quantityGrams: 100,
    nutrients: {}, estimatedNutrients: { Energy: { value: 530, unit: 'kcal/100g' }, Protein: { value: 6, unit: 'g/100g' }, Carbohydrates: { value: 50, unit: 'g/100g' }, Sugars: { value: 2.5, unit: 'g/100g' }, Fat: { value: 35, unit: 'g/100g' }, 'Saturated fat': { value: 18, unit: 'g/100g' }, Fibre: { value: 3, unit: 'g/100g' }, Salt: { value: 1.3, unit: 'g/100g' }, 'Vitamin C': { value: 8, unit: 'mg/100g' }, 'Vitamin B1': { value: 0.17, unit: 'mg/100g' }, 'Vitamin B2': { value: 0.1, unit: 'mg/100g' }, 'Vitamin B6': { value: 0.2, unit: 'mg/100g' }, 'Vitamin B12': { value: 0.1, unit: 'µg/100g' } },
    modeledFields: ['Product profile', 'Nutrition', 'Packaging', 'Manufacturing location', 'Transit conditions'], sourceUrl: 'https://world.openfoodfacts.org/product/8901491100267/potato-chips-lay-s', fetchedAt: '2026-09-04T00:00:00.000Z',
    demoRoute: { origin: { latitude: 27.8014, longitude: 77.5055, label: 'Kosi Kalan, Mathura, Uttar Pradesh' }, destination, path: [[27.8014, 77.5055], [12.9818, 79.1368]], distanceKm: 2018.4, durationHours: 34.5, weather: { averageTemperatureC: 32, minimumTemperatureC: 29, maximumTemperatureC: 36, sampleCount: 5, observedAt: '2026-09-04T12:00:00Z' }, routingKind: 'driving', originKind: 'researched-source' },
  },
}

export function getDemoProduct(barcode: string) { return demoProducts[barcode] }
