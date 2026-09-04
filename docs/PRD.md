# Product Requirements Document

## Product

Sork makes the hidden trade-offs behind packaged food easier to understand. A user enters a barcode, sees verified product information, then explores how temperature, time, transport mode, and route assumptions affect a modeled supply-chain scenario.

## Problem

Consumers can often see a printed expiry date, but they cannot easily understand:

- What product and ingredient information is available from a public source.
- How ultra-processing and additives are represented.
- How packaging and transport affect the product’s environmental story.
- How temperature and transit time could affect nutrient availability in a scenario.

The product addresses this information gap with an interactive explanation, not a claim of precise real-world measurement.

## Target audience

- Hackathon judges and demo audiences.
- Consumers curious about food transparency.
- Students and developers exploring food-supply-chain data.

## MVP user journey

1. User lands on the Sork landing page.
2. User enters a valid 13-digit EAN barcode or selects a verified barcode preset.
3. The app fetches product facts from Open Food Facts.
4. The app displays available product facts and clearly identifies missing fields.
5. User adjusts temperature, transit time, route, mass, and transport mode.
6. The app renders the decay curve, modeled emissions, ingredient analysis, and route map when sufficient inputs exist.
7. User can inspect the assumptions and source attribution behind each result.

## MVP features

### Landing page

- Problem statement.
- Short explanation of the barcode-to-scenario flow.
- Call to action into the dashboard.
- Plain-language limitations statement.

### Barcode lookup

- EAN-13 validation.
- Spaces and hyphens tolerated during input normalization.
- Loading, not-found, timeout, malformed-response, and partial-data states.
- Live Open Food Facts lookup.
- Two verified barcode-only demo presets:
  - Max Protein Bar: `8906009532363`
  - Lay’s Chips: `8901491503020`
- The Kolar Spinach Batch preset is intentionally omitted until a verified barcode is provided.

### Product facts

Show only values returned by the source, including when present:

- Product name and brand.
- NOVA group.
- Eco-Score.
- Ingredients.
- Additives and additive tags.
- Packaging components.
- Origins and countries.
- Quantity and available nutrient values.

### Scenario controls

- Transit temperature: 15°C–42°C.
- Transit duration: 0–48 hours.
- Transport mode: ambient truck or cold-chain reefer.
- Optional distance, mass, origin, destination, and printed expiry inputs.

### Dashboard outputs

- Nutrient decay scenario and remaining modeled availability.
- Transport and packaging carbon scenario when required inputs exist.
- NOVA, additive, and ingredient analysis from sourced product data.
- Recharts decay graph.
- Leaflet route visualization when route data is valid.
- Assumptions and source panel.

## Out of scope

- Authentication, accounts, saved products, or history.
- Camera scanning.
- Invented product data or guessed route locations.
- Claims that modeled outputs are laboratory measurements.
- A water-footprint metric without a documented coefficient and complete required inputs.

## Success criteria

- A user can complete the main demo flow in under three minutes.
- Product facts are fetched live and not hardcoded.
- Missing source data is visible and understandable.
- Temperature and cold-chain controls visibly alter the modeled scenario.
- Carbon output is withheld when mass or distance is unavailable.
- The app works without login.
- The project can be understood and run from the repository documentation.
