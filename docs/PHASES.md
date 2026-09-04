# Implementation Phases

The work is designed for two people. Both teammates review the shared contracts and integrate before demo preparation.

## Phase 0 — Contract and documentation

Owners: both.

- Create and review all project documentation.
- Confirm API fields and attribution requirements.
- Define TypeScript contracts.
- Record assumptions and unavailable-data behavior.
- Confirm the two verified barcode presets.

Exit criteria: no unresolved product-data or modeling-policy decisions remain.

## Phase 1 — Foundation

Owner A:

- Scaffold React, Vite, and TypeScript.
- Add linting, formatting, Vitest, and Testing Library.
- Add the application shell and route structure.

Owner B:

- Implement the landing page.
- Define the visual system in code: type scale, spacing, colors, cards, states, and controls.
- Add responsive layout primitives.

Exit criteria: clean app boot, navigable landing page, and shared component conventions.

## Phase 2 — Data integration

Owner A:

- Implement EAN-13 normalization and validation.
- Implement the Open Food Facts client.
- Normalize API responses into `ProductFacts`.
- Add request cancellation, timeout, retry, and error states.

Owner B:

- Implement search input, loading state, not-found state, and partial-data state.
- Implement the barcode-only presets.

Exit criteria: a live barcode lookup renders verified product facts without mocked production data.

## Phase 3 — Scenario engine

Owner A:

- Implement Q10 decay calculations.
- Implement emissions calculations.
- Implement ingredient/additive analysis.
- Implement result availability and assumption metadata.

Owner B:

- Implement scenario controls and control-state persistence during the current view.
- Define the metric-card presentation states.

Exit criteria: changing temperature, transit time, mass, distance, or mode produces deterministic typed results.

## Phase 4 — Visual dashboard

Owner B:

- Implement metric cards.
- Implement the Recharts decay graph.
- Implement the Leaflet route view.
- Implement cold-chain comparison.
- Add source and assumptions panel.

Owner A:

- Integrate model results with the dashboard.
- Add route resolution and unavailable-route behavior.
- Review all calculations and labels for scientific overclaiming.

Exit criteria: complete dashboard flow works for full-data and incomplete-data products.

## Phase 5 — Quality and resilience

Owners: both.

- Add unit and integration tests.
- Add end-to-end barcode journey.
- Test mobile and desktop layouts.
- Test keyboard navigation and screen-reader labels.
- Test API failure and missing-field behavior.
- Verify no product data is embedded in UI components.

Exit criteria: acceptance criteria in [`TESTING.md`](TESTING.md) pass.

## Phase 6 — Demo readiness

Owners: both.

- Run the demo flow using live API data.
- Confirm source attribution and disclaimers are visible.
- Prepare the presentation narrative.
- Verify the recovery steps in [`DEMO-RUNBOOK.md`](DEMO-RUNBOOK.md).
- Freeze feature scope before the presentation.

Exit criteria: the full story can be demonstrated reliably in under three minutes.
