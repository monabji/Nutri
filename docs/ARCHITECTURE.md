# Soil2Fork Architecture

## Architectural shape

Soil2Fork is a client-first React application with three separate concerns:

```text
User input
   |
   v
Open Food Facts client ---> Normalized product facts
                                  |
                                  v
                         Local scenario engine
                                  |
                                  v
                         Dashboard visualizations
```

The application must not mix raw API response shapes, modeled values, and display formatting in the same component.

## Planned source structure

```text
src/
  api/
    openFoodFacts.ts
    normalizeProduct.ts
  components/
    DataState.tsx
    MetricCard.tsx
    SourcePanel.tsx
  config/
    presets.ts
    modelConfig.ts
  features/
    landing/
    dashboard/
  model/
    decay.ts
    emissions.ts
    ingredients.ts
    route.ts
  types/
    product.ts
    scenario.ts
    results.ts
  lib/
    barcode.ts
    formatting.ts
  App.tsx
```

## Data flow

1. The user enters or selects a barcode.
2. Input is normalized and validated as EAN-13.
3. `fetchBarcodeData` requests the selected Open Food Facts fields.
4. The raw response is normalized into a stable internal `ProductFacts` type.
5. The dashboard renders sourced fields directly from `ProductFacts`.
6. Scenario controls create a `ScenarioInput` object.
7. Pure model functions calculate decay and emissions from product facts plus scenario inputs.
8. Visual components render either a result or an explicit unavailable state.

## Public interfaces

```ts
type FetchStatus =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; product: ProductFacts }
  | { kind: 'not-found'; barcode: string }
  | { kind: 'error'; message: string };

type ProductFacts = {
  barcode: string;
  name?: string;
  brands?: string[];
  novaGroup?: number;
  ecoScore?: string;
  ingredientsText?: string;
  additives?: string[];
  packaging?: PackagingComponent[];
  origins?: string[];
  quantityGrams?: number;
  nutrients: Record<string, NutrientValue>;
  sourceUrl: string;
};

type ScenarioInput = {
  temperatureC: number;
  transitHours: number;
  transportMode: 'ambient-truck' | 'cold-chain-reefer';
  distanceKm?: number;
  productMassKg?: number;
  origin?: string;
  destination?: string;
  printedExpiryDate?: string;
};

fetchBarcodeData(barcode: string): Promise<FetchStatus>;
calculateDecay(input: DecayInput): DecayResult;
calculateEmissions(input: EmissionsInput): EmissionsResult;
analyzeIngredients(input: IngredientInput): IngredientAnalysis;
resolveRoute(input: RouteInput): Promise<RouteResult>;
```

## API layer

The API layer owns:

- Barcode URL construction.
- Field selection.
- Request cancellation and timeout handling.
- Response validation.
- Normalization from Open Food Facts fields to application types.
- Source URL creation and attribution metadata.

The API layer must not calculate decay, emissions, or display-ready text.

## Model layer

The model layer contains pure, deterministic functions. It must:

- Accept explicit inputs.
- Return intermediate values where useful for explanation.
- Return an unavailable result when required inputs are missing.
- Never silently substitute product-specific values.
- Use versioned, documented constants from `modelConfig`.

The decay model uses the requested exponential form:

```text
C(t) = C0 × e^(-k × t)
```

Temperature adjustment is based on a documented Q10 assumption. The UI must disclose that this is a scenario model.

The cold-chain toggle applies the agreed demo assumptions of 80% lower modeled nutrient loss and 40% higher modeled transport emissions. These are scenario modifiers, not source facts.

## Visualization layer

- Recharts receives a normalized `DecayPoint[]` series.
- Leaflet receives route coordinates only after valid origin and destination resolution.
- Metric cards receive typed result objects, not raw API responses.
- Every metric card supports `available`, `unavailable`, and `error` states.

## Failure handling

- Invalid barcode: explain the required format before making a request.
- Product missing: offer another barcode.
- API unavailable: show a retry action and source link when possible.
- Missing nutrient: do not render a nutrient-loss percentage for that nutrient.
- Missing mass or distance: show why carbon cannot be calculated.
- Missing route coordinates: show the route map empty state instead of guessing.
- Missing expiry: show that bio-availability horizon requires a user-entered printed expiry date.
