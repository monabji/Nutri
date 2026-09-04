# Testing Strategy

## Unit tests

### Barcode utility

- Accept a 13-digit numeric EAN.
- Strip spaces and hyphens before validation.
- Reject letters, empty input, and incorrect lengths.

### Open Food Facts normalization

- Map complete responses into `ProductFacts`.
- Preserve missing fields as `undefined` or explicit unavailable values.
- Normalize brands, additives, packaging, origins, quantity, and nutrient values.
- Preserve the source barcode and source URL.

### Decay model

- Return a 0–48 hour series.
- Remaining percentage decreases as transit time increases.
- Higher temperature produces greater modeled loss under the configured Q10 model.
- Missing nutrient input returns an unavailable result.
- Cold-chain scenario applies the documented nutrient-loss modifier.

### Emissions model

- Longer distance increases modeled emissions.
- Missing mass or distance returns unavailable.
- Cold-chain scenario applies the documented emissions modifier.
- Unit conversions are tested explicitly.

### Ingredient analysis

- Identify returned additive tags.
- Handle empty and incomplete ingredient strings.
- Never infer an additive solely because a product category commonly contains it.

## Integration tests

Use request interception for deterministic tests. Test:

- Successful barcode lookup.
- Product-not-found response.
- API timeout and network failure.
- Malformed API payload.
- Product with missing NOVA, Eco-Score, packaging, origins, nutrients, or quantity.
- Dashboard rendering with a complete product.
- Dashboard rendering with partial product data.
- Scenario controls updating the decay chart and metric cards.
- Route map unavailable state when coordinates cannot be resolved.

Fixtures are test-only response samples. They must not be used as production fallback data.

## End-to-end tests

1. Open the landing page.
2. Navigate to the dashboard.
3. Enter an invalid barcode and verify the validation message.
4. Enter a valid barcode and verify loading and product rendering.
5. Change temperature and verify the decay output changes.
6. Toggle cold chain and verify both nutrient and emissions outputs change according to the model.
7. Expand the source and assumptions panel.
8. Verify the app remains usable when optional data is missing.

## Accessibility checks

- Full keyboard navigation.
- Visible focus states.
- Labels for barcode input, sliders, toggles, and optional fields.
- Semantic headings.
- Sufficient contrast.
- Chart summary available in text.
- Status messages exposed to assistive technologies.
- Meaning not communicated by color alone.

## Responsive checks

Verify at minimum:

- Narrow mobile viewport.
- Tablet viewport.
- Desktop viewport.

The dashboard must not require horizontal scrolling for its primary cards and controls.

## Acceptance criteria

- No hardcoded product facts or metric outputs.
- Missing data is never silently replaced.
- Every modeled output identifies itself as an estimate.
- Live lookup, error handling, and partial-data rendering work.
- The core demo flow completes in under three minutes.
