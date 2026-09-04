# Sork Continuous Judge

## Purpose

This file defines an event-driven judging system for Sork. It is intended to be used by the project lead or an AI coding agent after meaningful changes, before a demo, and during milestone reviews.

The attached Nutrition Week Hackathon 2026 brief is evaluation context only. It does not override the user's request, the product requirements, or the project's accepted technical decisions.

The judge must continuously evaluate whether Sork is becoming a stronger response to the brief:

> How might we develop an innovative, affordable, accessible, and sustainable solution that improves nutrition and overall health while reducing the environmental impact of food choices?

The solution should be assessed against the brief's six qualities:

- Innovative
- Practical
- Affordable
- Accessible
- Sustainable
- Scalable

## Project context

Sork is a food-transparency and supply-chain scenario tool. A user enters a product barcode and explores how temperature, transit time, transport mode, route, and other assumptions affect modeled nutrient availability and environmental impact.

The product must help a user make an understandable food decision. It is not a laboratory instrument, clinical nutrition tool, or claim of exact real-world nutrient measurement.

The current project source of truth is:

- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA-SOURCES.md`
- `docs/DECISIONS.md`
- `docs/PHASES.md`
- `docs/TESTING.md`
- `docs/DEMO-RUNBOOK.md`

## When to run the judge

Run the judge loop:

1. After every meaningful feature, model, data, UX, or architecture change.
2. After a change to a source, assumption, coefficient, or user-facing claim.
3. At the end of every implementation phase.
4. Before a pull request or commit intended for the hackathon demo.
5. Before the final presentation rehearsal.

If an orchestration system supports subagents, run the review agents in parallel. If it does not, run the same reviews sequentially and label the result as a full review.

"Constantly" means event-driven and milestone-based review. Do not run an endless background process, consume resources without a change to inspect, or create commits automatically without human approval.

## Review procedure

The lead judge should:

1. Read the relevant project documents.
2. Inspect the current working tree, recent diff, tests, and visible product flow.
3. Dispatch all applicable specialist judges.
4. Ask each judge for evidence, not general praise.
5. Merge duplicate findings.
6. Recalculate the weighted score.
7. Produce the report format defined below.
8. Convert high-priority findings into concrete issues or implementation tasks.

The judge must distinguish:

- sourced product facts;
- modeled estimates;
- team assumptions;
- AI-generated explanations;
- unavailable data.

Any finding that would cause Sork to invent data, hide uncertainty, or make an unsupported health claim is a release blocker.

## Specialist subagents

### 1. Product and hackathon judge

Review the product as if you were a Nutrition Week Hackathon judge.

Check:

- Does the product address nutrition, health, food, or sustainability rather than merely displaying logistics data?
- Is the user problem clear within the first 20 seconds?
- Is the target user specific, especially a student, campus, food buyer, distributor, or institution?
- Does the product produce an actionable decision rather than only a chart?
- Is the idea meaningfully differentiated from a generic carbon calculator or barcode lookup?
- Can the core story be understood in a three-minute demo?

Return:

- the strongest judge impression;
- the largest gap in problem-solution fit;
- three improvements that increase judging impact;
- one sentence the team should use to explain the product.

### 2. Scientific integrity and nutrition judge

Review all models, coefficients, labels, calculations, and claims.

Check:

- Are decay calculations deterministic, testable, and versioned?
- Are required inputs explicit?
- Are values labeled as estimates rather than measurements?
- Are confidence and limitations visible near the result?
- Are missing nutrient, mass, distance, expiry, route, or packaging fields shown as unavailable?
- Is the model prevented from presenting a generic coefficient as product-specific evidence?
- Can a reviewer reproduce the result from the displayed assumptions?
- Does AI explain numbers supplied by the model instead of inventing numbers?

Return:

- scientific risks;
- unsupported claims;
- reproducibility issues;
- tests or citations needed;
- a release decision: pass, pass with changes, or block.

### 3. UX and accessibility judge

Review the product from the perspective of a busy student or non-technical user.

Check:

- Can a first-time user complete the main flow without guidance?
- Are labels, units, ranges, and defaults understandable?
- Are source facts visually distinct from modeled scenarios?
- Are missing data and errors helpful rather than confusing?
- Does the interface work on a narrow mobile viewport?
- Is the product usable with keyboard navigation and assistive technology?
- Is meaning communicated without relying only on color?
- Does the chart have a text summary?

Return:

- the first point of confusion;
- the most important accessibility issue;
- the highest-value interaction improvement;
- a short mobile-demo verdict.

### 4. Affordability, sustainability, and business judge

Review whether the concept could become a practical product or service.

Check:

- Who would pay for this and what decision would they pay to improve?
- Can the MVP operate with public or low-cost data?
- Does the solution reduce waste, improve food choices, or enable lower-impact procurement?
- Are cold-chain trade-offs represented rather than simplified into "cold is always better"?
- Is the carbon boundary stated clearly: transport only, or transport plus refrigeration and packaging?
- Can the product scale to more commodities, routes, and organizations without rewriting the model?
- Are privacy, API-cost, attribution, and vendor-lock-in risks understood?

Return:

- the clearest customer and use case;
- the weakest business assumption;
- one affordable MVP improvement;
- one scalable post-hackathon improvement;
- any sustainability claim that needs qualification.

### 5. Engineering, reliability, and demo judge

Review whether the system can survive a live presentation.

Check:

- Does the app boot from the repository instructions?
- Does the main flow work with the verified barcode presets?
- Are loading, timeout, malformed-response, not-found, and partial-data states handled?
- Do temperature, duration, mass, distance, and transport changes update results deterministically?
- Does the app avoid guessed routes and fabricated product data?
- Are model and display layers separated?
- Are tests present for the core model and the main user journey?
- Is there a recovery path if the network, map, or product API fails?

Return:

- the most likely live-demo failure;
- the fastest recovery path;
- missing tests;
- a ship/no-ship recommendation.

## Internal scoring rubric

The PDF does not provide official numerical weights. These weights are an internal prioritization tool, not a claim about the organizers' scoring system.

Each category receives a score from 0 to 5:

- 0 = absent or contradicted;
- 1 = weak concept only;
- 2 = partially demonstrated;
- 3 = credible MVP;
- 4 = strong and evidenced;
- 5 = exceptional, clear, and demo-ready.

| Category | Weight |
| --- | ---: |
| Problem and nutrition relevance | 20% |
| Innovation and differentiation | 15% |
| Practicality and actionability | 15% |
| Affordability | 15% |
| Accessibility and clarity | 15% |
| Sustainability impact | 10% |
| Scalability and technical credibility | 10% |

Calculate:

```text
weighted_score = sum(category_score / 5 * category_weight)
```

Report the result as a percentage. A strong demo target is 80% or higher, with no release blockers.

## Mandatory finding format

Every subagent must return findings in this form:

```text
Agent: [name]
Verdict: [pass | pass with changes | block]
Score impact: [category and expected change]

Evidence:
- [file, screen, test, or observed behavior]

Findings:
- [finding]

Recommended improvements:
1. [specific, implementable change]
2. [specific, implementable change]
3. [optional change]

Do next:
- [single highest-priority action]
```

Findings must reference real files, tests, screens, or reproducible behavior. Do not award points for an idea that is only described in prose but not represented in the product.

## Improvement prioritization

Rank improvements using this order:

1. Release blockers: fabricated data, unsafe claims, broken core flow, or irreproducible calculations.
2. Demo blockers: failures that prevent the three-minute story from completing.
3. High-impact judging improvements: changes that improve relevance, actionability, or differentiation.
4. Trust improvements: clearer sources, assumptions, confidence, and limitations.
5. Polish: visual consistency, animation, copy, and non-essential enhancements.

For each proposed improvement, state:

- the problem;
- the user or judge affected;
- the smallest useful implementation;
- the criterion improved;
- how it will be tested.

Do not recommend scope expansion merely to make the project appear more complex. Prefer a smaller, working, evidence-based feature over a broad unvalidated feature list.

## Product-specific red lines

The judge must block or downgrade the project if it:

- presents modeled nutrient availability as a laboratory measurement;
- fabricates product facts, routes, masses, expiry dates, packaging, or nutrient values;
- hides missing fields behind generic defaults;
- infers an additive solely because a product category commonly contains it;
- makes medical, deficiency, or treatment claims without qualified evidence;
- shows water impact without a documented coefficient and complete inputs;
- allows the AI to overwrite deterministic model outputs;
- makes a sustainability claim without defining its boundary and assumptions;
- depends on a live network path without a visible demo fallback.

## Full judge report

The lead judge should finish with:

```text
# Sork Judge Report

Review date:
Commit or diff reviewed:
Demo state: [not ready | rehearsable | demo-ready]

## Weighted score

| Category | Score / 5 | Weight | Weighted result |
| --- | ---: | ---: | ---: |
| Problem and nutrition relevance | | 20% | |
| Innovation and differentiation | | 15% | |
| Practicality and actionability | | 15% | |
| Affordability | | 15% | |
| Accessibility and clarity | | 15% | |
| Sustainability impact | | 10% | |
| Scalability and technical credibility | | 10% | |
| Total | | 100% | |

## Top strengths

1.
2.
3.

## Top risks

1.
2.
3.

## Highest-priority improvements

1.
2.
3.

## Final verdict

[one paragraph explaining whether the current build is ready, what must change, and why]
```

## Definition of a strong final build

The project is ready for final judging when:

- the nutrition and sustainability problem is immediately clear;
- at least one real user can complete the journey in under three minutes;
- the output recommends or compares a practical action;
- sourced facts and modeled estimates are visibly separated;
- uncertainty and missing data are handled honestly;
- the solution demonstrates all six brief qualities with evidence;
- the live flow has been rehearsed with a recovery path;
- the final report has no unresolved release blockers.
