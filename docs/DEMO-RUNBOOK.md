# Demo Runbook

## Narrative

“A barcode tells us what a product is, but not what happened to it on the way to the shelf. Sork combines public product facts with a transparent transport scenario so people can see both what is known and what is being modeled.”

## Three-minute flow

### 1. Landing page — 20 seconds

- State the food-transparency problem.
- Explain the distinction between sourced facts and modeled scenarios.
- Open the dashboard.

### 2. Live lookup — 30 seconds

- Use the Max Protein Bar preset or enter `8906009532363`.
- Point out the product name, NOVA, Eco-Score, ingredients, additives, and packaging when available.
- Mention that the data is fetched from Open Food Facts.

### 3. Temperature scenario — 45 seconds

- Set transit temperature near the lower end.
- Move it toward 42°C.
- Show the change in the decay curve.
- Explain that this is a transparent Q10-based scenario estimate, not a lab result.

### 4. Transport trade-off — 45 seconds

- Enter a demo distance and mass during the live presentation if the product does not provide them.
- Compare ambient truck with cold-chain reefer.
- Show the modeled nutrient-loss improvement and emissions increase.

### 5. Data honesty — 30 seconds

- Open the source and assumptions panel.
- Show that missing origin, expiry, nutrient, or packaging fields remain unavailable.
- Explain that the app refuses to invent data.

### 6. Close — 10 seconds

“Sork turns an opaque food journey into an explorable decision surface while making the boundary between evidence and estimation visible.”

## Demo preparation

- Test both verified barcode presets against the live API.
- Confirm network access.
- Confirm chart and map libraries load.
- Confirm source attribution is visible.
- Confirm temperature and cold-chain controls produce visible changes.
- Confirm at least one product has enough data for the most complete dashboard path.

## Recovery steps

- If a preset product is missing, enter the other verified barcode.
- If the API is slow, explain the loading state and retry.
- If a product lacks nutrients, demonstrate NOVA, ingredients, packaging, or source transparency instead of inventing a decay result.
- If route data is unavailable, show the route empty state and explain why it is safer than guessing.
- If the map fails, continue with the product facts and decay chart; the map is an enhancement, not the source of truth.
