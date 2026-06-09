# Proposal: framework-agnostic component specs + design grammar

- **Status:** Proposed (not yet adopted)
- **Date:** 2026-06-07
- **Owner:** Leonid Romanov
- **Affects:** `packages/ui-react`, `packages/tokens-pd`, future Vue / Web
  Component implementations; the `ui-kit-pipeline` agent workflow.
- **Related:** [`context/roadmap.md`](../../../context/roadmap.md) (ui-react
  replaces legacy by Q3 2026; future non-React implementations),
  [`context/conventions.md`](../../../context/conventions.md).

## Problem

Today a component's "truth" is spread across several places: the React source
(`cva` variants, props), Storybook stories, Vitest tests, the Figma file, the
Figma Code Connect mapping, and prose in `AGENTS.md` / `context/*`. Nothing is a
single, framework-neutral, machine-readable description of **what a component
is** — its API contract, anatomy, states, behavior, accessibility obligations,
and how it composes with other components.

Two consequences:

1. **The roadmap wants more than React.** When a Vue or Web Component
   implementation lands, there is no shared contract for it to target — each
   implementation would re-derive the component's behavior from the React code
   or from Figma, and drift.
2. **Agents and tooling have no structured ground truth.** Our workflow is
   heavily agent-driven (`AGENTS.md`, the `ui-kit-pipeline`), but agents read
   prose, not a queryable contract. Docs, story scaffolds, and conformance
   checks can't be generated from a source that doesn't exist.

A precedent exists: the Acronis **Vue** UI Kit (`@uikit/ui-kit`, a separate
repo) ships two packages — `grammar` and `specs` — that solve exactly this. This
proposal evaluates adopting an **adapted** version here.

## The reference model (from the Vue ui-kit)

- **`grammar`** — a "design constitution" above any single component: a
  machine-readable registry of cross-component **rules** (`spacing/8px-grid`,
  `accessibility/focus-trap`, `interaction/escape-close`; each typed with
  `severity` `must`/`should`/`may`, `category`, `wcag`, `relatedRules`), plus
  **composition patterns** (confirmation dialog, table toolbar, master-detail…)
  that name the components they involve and the rules that govern them, plus a
  documented **override** mechanism. This is the **WHEN/WHY** layer and is where
  "live interaction between components" is captured.
- **`specs`** — one directory per component, a strict **7-file format**:
  - `index.yaml` — identity, status, category, Open UI mapping, dependencies.
  - `anatomy.yaml` — root element/role, named parts (incl. `::part()`), layout,
    and exhaustive visual states with triggers / `affects` / `exclusive_with`.
  - `api.yaml` — a **framework-agnostic `contract`** (properties, events, slots,
    methods) **plus an `adapters` block** with Vue / React / Web Component usage
    examples. This is the keystone for multi-framework implementation.
  - `tokens.yaml` — design tokens the component consumes.
  - `behavior.md` — Given/When/Then scenarios, incl. cross-component ones.
  - `accessibility.md` — ARIA, keyboard map, SR announcements, contrast.
  - `README.md` — when to use / not use, quick examples per framework.

Crucially, in the reference repo specs are **not documentation-only**: scripts
validate the YAML against JSON Schemas, validate that implementations conform,
and **generate Storybook stories and tests from the specs**. That generative /
conformance loop is what makes the model worth more than a wiki.

## Decision drivers

- **Multi-framework future** (roadmap): one contract, many implementations.
- **Agent-first repo:** structured, queryable ground truth beats prose.
- **Single source of truth** to end the kind of drift we already hit (Figma vs
  `tokens-pd` values on the Button work).
- **Timing:** `ui-react` has ~3 components today. Specs can _lead_
  implementation now, instead of retrofitting ~90 components later (as the Vue
  repo had to).

## Options considered

1. **Do nothing.** Keep truth spread across source/stories/tests/Figma.
   Cheapest now; pays the multi-framework and drift costs later, repeatedly.
2. **Lean on Storybook + Figma Code Connect only.** Improves docs and
   design↔code mapping, but neither is framework-neutral nor a queryable
   behavior/anatomy contract; neither drives conformance.
3. **Adopt the Vue system wholesale.** Maximum capability, but duplicates assets
   this repo already does _better_ (tokens) and imports Vue-specific shape.
4. **Adopt an adapted subset (recommended).** Take the framework-agnostic
   contract + anatomy + behavior + a11y + composition grammar; reference our
   existing token pipeline instead of duplicating it; require a conformance
   check from day one.

## Recommendation

Adopt **Option 4**: a new framework-agnostic spec package (working name
`packages/ui-spec`) plus a small machine-readable grammar, **spec-leads-
implementation**, with these scope decisions:

| Layer                                             | Decision                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api.yaml` contract + adapters                    | **Adopt fully** — the neutral contract future Vue/WC target.                                                                                                                              |
| `anatomy.yaml`, `behavior.md`, `accessibility.md` | **Adopt** — consolidates today's scattered knowledge.                                                                                                                                     |
| grammar rules + composition patterns              | **Adopt selectively** — start with the `must` rules (a11y, focus, escape-close). Overlaps `context/*` prose, but machine-readable is the upgrade.                                         |
| `tokens.yaml`                                     | **Do NOT duplicate values.** Our `design-tokens → tokens-pd` pipeline is more mature (DTCG, multi-brand, `light-dark()`). Specs **reference `--ui-*` token names**, never restate values. |
| `index.yaml` Figma link                           | Point at the existing Code Connect mapping; don't re-map.                                                                                                                                 |

### Non-negotiable: conformance, or it rots

A spec with no check degrades into stale documentation. Required from the start:

1. JSON-Schema validation of the YAML (specs are well-formed).
2. At least one **conformance test** — e.g. assert `button.tsx`'s `cva`
   `variant`/`size` keys match `api.yaml`'s `contract.properties` — reusing the
   existing Vitest setup. Story/test/doc generation from specs is the
   high-leverage follow-on, but the conformance check is what keeps it honest.

## Phased plan

- **Phase 0 — Spike (1 package, 3 components).** Stand up `packages/ui-spec`;
  author specs for `button`, `button-icon`, `switch` (tokens **by reference**);
  add JSON-Schema validation + one `cva`↔contract conformance test. Review.
- **Phase 1 — Grammar seed.** Encode the `must` rules as a typed registry; wire
  it into the `ui-kit-pipeline` so the Design/QA gates can cite rule IDs.
- **Phase 2 — Generation.** Generate Storybook story scaffolds (and/or test
  skeletons) from specs to prove the loop.
- **Phase 3 — Scale with the library.** Author a spec alongside every new
  `ui-react` component (it becomes part of the component's definition of done),
  growing coverage as ui-react expands toward replacing legacy.

## Risks & mitigations

- **Maintenance burden at scale** → specs lead, not retrofit; one spec per
  component is part of DoD, not a separate migration.
- **Spec/impl drift** → the conformance check (above) is mandatory, not optional.
- **Duplication with tokens-pd / Code Connect** → reference, never restate.
- **Adapter examples going stale** → keep examples minimal; consider generating
  them, or lint them against the public API.

## Open questions

- Package name/placement: `packages/ui-spec` (published?) vs a private tool.
- Does the grammar live in the same package or its own?
- How much of the Vue repo's `generate-*-from-specs` tooling do we port vs.
  rebuild around our Vite/Vitest/Storybook 10 setup?
- Do we align component/prop naming to Open UI now (as the Vue repo does), or
  keep the current shadcn-derived names?

## References

- Reference implementation: `@uikit/ui-kit` `packages/grammar` and
  `packages/specs` (separate Vue repo). 7-file spec format; ~90 components;
  `validate-specs` / `validate-components` / `generate-stories-from-specs` /
  `generate-tests-from-specs`.
