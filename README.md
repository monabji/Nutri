# sork.

sork. is a no-auth hackathon web app that turns an EAN-13 barcode into a transparent food-supply-chain scenario dashboard.

The app combines:

1. Live product facts from Open Food Facts.
2. User-controlled transport assumptions.
3. Clearly labeled local estimates for nutrient decay and transport emissions.

It is an information and education tool, not a laboratory, medical, nutrition, or environmental accounting system.

## Project status

Phase 1 is implemented: a responsive, dark-mode landing page for `sork.`. The dashboard remains intentionally out of scope until a later phase.

## Planned stack

- React
- Vite
- TypeScript
- Recharts for the decay chart
- Leaflet for route visualization
- Vitest and Testing Library for automated tests
- Playwright for end-to-end testing

## Core principles

- Product facts are fetched live; they are not embedded in application code.
- Missing API fields remain unavailable rather than being guessed.
- Modeled values are separated from sourced facts and disclose their assumptions.
- The app has no authentication, user accounts, or saved history.
- No UI mockups or generated visual concepts are part of the project.

## Documentation

- [`docs/PRD.md`](docs/PRD.md) — product requirements and MVP scope.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system structure and data flow.
- [`docs/DATA-SOURCES.md`](docs/DATA-SOURCES.md) — source fields, model inputs, and data limitations.
- [`docs/PHASES.md`](docs/PHASES.md) — phased implementation plan for two teammates.
- [`docs/TESTING.md`](docs/TESTING.md) — testing and acceptance strategy.
- [`docs/DEMO-RUNBOOK.md`](docs/DEMO-RUNBOOK.md) — presentation flow and demo recovery steps.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — important product and technical decisions.
- [`design.md`](design.md) — landing-page visual direction and component rules.

## Open Food Facts

The planned integration uses the Open Food Facts product-by-barcode API and requests only the fields needed by the application. The API requires appropriate identification for production clients; the final implementation must follow the current Open Food Facts API guidance and attribution requirements.

- [Get product details by code](https://openfoodfacts.github.io/documentation/docs/Product-Opener/v2/products/get-product-by-code/)
- [Open Food Facts API tutorial](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorial-off-api/)
