# Architecture and Product Decisions

## Decision 1 — No authentication

Status: accepted.

Soil2Fork is an informational hackathon demo. It does not need accounts, persistence, or identity.

## Decision 2 — Live product facts

Status: accepted.

Product information comes from Open Food Facts at lookup time. Product names, scores, ingredients, packaging, origins, and nutrient values must not be hardcoded.

## Decision 3 — Barcode-only presets

Status: accepted.

Preset configuration may contain verified barcode identifiers only. It must not contain cached product specifications.

Current presets:

- `8906009532363` — Max Protein Bar.
- `8901491503020` — Lay’s Chips.

The Kolar Spinach Batch preset is excluded until a real EAN is supplied.

## Decision 4 — Sourced facts versus modeled estimates

Status: accepted.

The dashboard separates API facts from local calculations. Every modeled result exposes its assumptions and uses estimate language.

## Decision 5 — Missing data is visible

Status: accepted.

The application does not fabricate expiry dates, routes, masses, nutrient values, packaging materials, or emissions results.

## Decision 6 — Printed expiry is user input

Status: accepted.

Printed expiry is not treated as reliably available from Open Food Facts. The user may enter it for the scenario model; otherwise the bio-availability horizon remains unavailable.

## Decision 7 — Concrete implementation default

Status: accepted.

Use React, Vite, and TypeScript. Keep API, model, and type interfaces framework-independent enough to support future migration.

## Decision 8 — Water impact is not forced into the MVP

Status: accepted.

Water impact will only be shown when the team has a documented coefficient and complete input requirements. The app must not show a generic water number just to fill a card.

## Decision 9 — No UI mockups

Status: accepted.

The project will use written interaction requirements and implemented UI states. No mockup images or generated design concepts are required.
