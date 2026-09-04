# Data Sources and Modeling Policy

## Source of product facts

Open Food Facts is the source for product-level facts. The implementation should use the product-by-barcode API with a limited `fields` query and preserve the returned barcode as the source identifier.

Relevant source fields may include:

- `product_name`
- `brands`
- `nova_group`
- Eco-Score fields
- `ingredients_text`
- Additive tags and ingredient analysis fields
- `packaging` or structured packaging components
- `origins` and country fields
- `quantity`
- `nutriments`

The exact field list must be confirmed against the API schema during implementation. Open Food Facts documents barcode lookup and field selection in its [product API documentation](https://openfoodfacts.github.io/documentation/docs/Product-Opener/v2/products/get-product-by-code/).

## Provenance rules

- Every sourced value is rendered with Open Food Facts attribution.
- The UI distinguishes “reported by source” from “modeled scenario.”
- Missing values display as “Not reported by Open Food Facts.”
- No product-specific fallback values are permitted.
- Test fixtures may contain representative API responses, but fixtures must never be shipped as demo product data.

## Modeling rules

Modeled outputs are allowed only when all required inputs are available and the relevant assumption is documented.

### Nutrient decay

Inputs:

- Nutrient value returned by Open Food Facts.
- Temperature.
- Transit duration.
- Q10 coefficient from the versioned model configuration.
- Baseline decay coefficient from the versioned model configuration.

Output:

- Remaining modeled percentage over 0–48 hours.
- Modeled percentage loss.
- Optional modeled bio-availability horizon when the user supplies a printed expiry date and the configured threshold is available.

The result must be labeled as an estimate. It must not be described as measured nutrient content.

Current local model configuration is versioned as `1.0`: a 20°C reference
temperature, Q10 of 2, a 0.003 per-hour baseline loss coefficient, a 70%
availability horizon, and an 80% modeled loss reduction for the cold-chain
comparison. These are scenario assumptions, not claims about a specific product.

### Transport emissions

Inputs:

- Product mass.
- Distance.
- Transport mode.
- Documented freight-intensity coefficient.

If mass or distance is missing, the result is unavailable. The app must not infer a route or product mass from the brand, product name, or barcode.

The current local factors are 0.09 kg CO₂e per tonne-km for an ambient truck
and 0.126 kg CO₂e per tonne-km for a cold-chain reefer. The reefer factor is a
40% comparison modifier. Both values are displayed as model assumptions.

### Packaging

Packaging labels are displayed from the returned Open Food Facts packaging data. The app may group returned packaging tags for readability, but it must not invent a packaging material when the source omits it.

### Ingredient analysis

Ingredient analysis is source-derived. The app may identify returned additive tags and ingredient aliases, but the UI must explain that absence from the returned data does not prove absence from the physical product.

### Water impact

Water impact is not an MVP output unless the team adds a documented coefficient, source, and complete input contract. A missing water model must be represented as unavailable rather than replaced with a generic estimate.

## Preset policy

Presets contain identifiers only:

- `8906009532363` — Max Protein Bar.
- `8901491503020` — Lay’s Chips.

The Kolar Spinach Batch preset is excluded until a verified EAN is supplied. No spinach product record or synthetic barcode may be created.

## Source and limitation panel

The dashboard must provide a compact expandable panel containing:

- Open Food Facts source link.
- Fetch timestamp.
- Fields unavailable from the source.
- Model version.
- Model coefficients and scenario modifiers.
- Plain-language disclaimer.

## Optional camera and route inputs

- Barcode camera scanning is a client-side convenience input. A detected EAN-13
  value is validated before the existing live lookup flow runs; no image is
  uploaded or retained by the app.
- A route map is optional. When a user enters an origin and destination, the app
  asks OpenStreetMap's Nominatim service to resolve the places. The drawn line
  is a direct geographic connection, not a claim about a real road route.
- After a successful scan, the app attempts an automatic route to the fixed demo
  destination `Katpadi, Vellore`. It prefers the manufacturing place reported by
  Open Food Facts. If that place is absent but the source reports a country, a
  server-side grounded lookup identifies a likely public manufacturing location
  in that country, then Nominatim geocodes it, OSRM calculates a driving route,
  and Open-Meteo samples current temperatures along the route. The resulting
  distance, duration, and weather are live context—not proof of the product's
  actual historical journey.
- If a manufacturing place, location permission, route, or weather is absent,
  the corresponding output stays unavailable. The app never substitutes a
  brand, barcode prefix, or preconfigured factory location.
- The client serializes and caches Nominatim requests to respect its public
  one-request-per-second constraint. A production release should use an
  identified server-side geocoding provider or an approved Nominatim deployment.
