# P3 / P4 — composites, design-system & complex — breakdown

> Phases P3–P4 of [roadmap.md](./roadmap.md). Builds on
> [P2 primitives](./backlog-p2-primitives.md). Same DoD and conventions as P2
> (Base UI source, CVA variants, `--av-*` theming, test + light/dark story +
> changeset + a11y, optional Code Connect).
>
> These are further out and carry more design unknowns, so estimates are coarser.
> Each ★ = recommended v1 must-have; un-starred = first trim candidates.

---

## P3 — Tier 2 composites (Jul–Aug)

Built on P2 primitives. Estimate key as in P2 (S/M/L; XL ≈ 5+ days).

| Task                        | Base UI                   | Est | Deps (from P2)          | Notes                                                        |
| --------------------------- | ------------------------- | --- | ----------------------- | ------------------------------------------------------------ |
| ★Dropdown Menu              | `Menu`                    | M   | Popover                 | sub-menus, separators, checkbox/radio items                  |
| ★Combobox                   | `Combobox`/`Autocomplete` | L   | Popover, Input          | async options, filtering, multi later                        |
| ★Tabs                       | `Tabs`                    | M   | —                       | horizontal/vertical, manual/auto activation                  |
| ★Accordion                  | `Accordion`               | M   | —                       | single/multiple, collapsible                                 |
| ★Number Field               | `NumberField`             | M   | Input, Field            | min/max/step, scrub, format                                  |
| ★Slider                     | `Slider`                  | M   | —                       | single + range, marks                                        |
| ★Toggle Group               | `Toggle` / `ToggleGroup`  | S   | —                       | single/multiple, used by toolbars                            |
| Collapsible                 | `Collapsible`             | S   | —                       | primitive behind Accordion/Sidebar                           |
| ★Avatar                     | `Avatar`                  | S   | —                       | image + fallback, sizes                                      |
| ★Badge                      | styled                    | S   | —                       | variants (status colors)                                     |
| Chip / Tag                  | styled                    | S   | —                       | removable, selectable                                        |
| ★Alert                      | styled                    | S   | —                       | severity variants, dismissible                               |
| ★Progress                   | `Progress`                | S   | —                       | linear; (Meter optional)                                     |
| ★Skeleton                   | styled                    | S   | —                       | shape variants                                               |
| ★Spinner                    | styled                    | S   | —                       | sizes                                                        |
| ★Toast (Sonner)             | `Toast`                   | M   | —                       | **fix imperative `toast()` export split (#100)** when ported |
| Tooltip portal escape hatch | —                         | —   | (done in P2 T1.9 / #47) | —                                                            |

**P3 Tier 2 rough total:** ~10×S + 5×M + 1×L ≈ **22–28 dev-days**.

### P3 — Tier 3 design-system / layout / shell (the scope lever)

Composed from primitives + Tier 2; mostly layout/markup + tokens, lighter on
behavior. ★ = v1 must-have.

| Group            | Components                                                                                                                                                 | Est (each)                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Layout           | ★Card, ★Stack, ★Grid, ★Section, ★Scroll Area, Aspect Ratio, Resizable                                                                                      | S–M                         |
| Shell / nav      | ★App Shell, ★Sidebar, ★Navigation Menu, ★Breadcrumb, ★Pagination, ★Page Header, ★Page Content, Secondary Menu, Auth Layout, Dashboard Layout, Split Layout | S–L (App Shell/Sidebar = L) |
| Feedback         | ★Empty                                                                                                                                                     | S                           |
| Form composition | ★Form, Filter                                                                                                                                              | M                           |
| Acronis widgets  | Widget (base) + Alert/Placeholder/Text/Progress(chunks,tiers)/Protection Status/Protection Summary/Table Data                                              | M each                      |

**P3 Tier 3 rough total (★ only):** ~**20–26 dev-days**. Full list incl. widgets +
extra layouts: **+12–16 dev-days** (the trim buffer).

---

## P4 — complex / data (Aug–Sep) — Epic E3

The hardest, most design-dependent work. Table is a cluster, not one task.

### Table (foundation + the open-issue cluster)

| Task                                | Issue    | Est | Notes                                                                      |
| ----------------------------------- | -------- | --- | -------------------------------------------------------------------------- |
| ★Table base + semantics             | —        | M   | header/body/row/cell, density variants                                     |
| ★Scroll-friendly layout primitives  | #45, #49 | M   | vertical + horizontal scroll containers                                    |
| ★Sticky / frozen columns            | #44      | L   | pinned left/right; interacts with scroll + resize                          |
| ★Resizable columns                  | #46      | L   | drag handles, min/max, persistence hook                                    |
| ★Column header sort (inline-toggle) | #48      | M   | not Dropdown-only; uses Tooltip escape hatch (#47)                         |
| ★Data Table (composition)           | #86      | XL  | selection (indeterminate Checkbox), sorting, pagination, column visibility |

**Table cluster rough total:** ~**14–18 dev-days**. Sticky + resize + Data Table
interact — sequence them together, ideally one owner, to avoid integration churn.

### Other complex components (all in v1)

| Task         | Base UI / source                         | Est | Notes                                    |
| ------------ | ---------------------------------------- | --- | ---------------------------------------- |
| ★Calendar    | custom (no Base UI primitive)            | L   | range, min/max, localization             |
| ★Date Picker | Calendar + Popover + Input               | M   | builds on Calendar + P2                  |
| ★Tree        | custom                                   | L   | expand/collapse, selection, keyboard nav |
| ★Chart       | wrapper (e.g. Recharts/visx) over tokens | L   | decide lib; theme via `--av-*`           |
| Carousel     | custom / embla                           | M   | trim candidate                           |
| Command      | Combobox + Dialog                        | M   | command palette; builds on P2/P3         |

**Other complex rough total:** ~**16–20 dev-days**.

---

## Whole-plan rollup (rough, for capacity planning)

| Phase            | Scope             | Dev-days (★ must-have) | + trim buffer                   |
| ---------------- | ----------------- | ---------------------- | ------------------------------- |
| P2 primitives    | 11 components     | 18–22                  | —                               |
| P3 Tier 2        | ~16 composites    | 22–28                  | —                               |
| P3 Tier 3        | layout/shell/form | 20–26                  | +12–16 (widgets, extra layouts) |
| P4 Table cluster | 6 tasks           | 14–18                  | —                               |
| P4 other complex | 6 components      | 16–20                  | (Carousel ~M trimmable)         |
| **Total**        |                   | **~90–114 dev-days**   | **+~14–18**                     |

### Capacity read (2–4 devs, today = 2026-06-05 → end Sep ≈ 4 months)

- 4 months ≈ **~75–85 working days/dev** (allowing meetings, reviews, ramp).
- **2 devs** ≈ 150–170 dev-days capacity → fits **★ must-haves (~90–114)** with
  buffer, but little slack for unknowns/QA hardening. Trim the widget family +
  extra layouts.
- **3–4 devs** ≈ 225–340 dev-days → comfortably covers full scope incl. trim
  buffer + E1/E6/E7 overhead + integration.
- **Critical-path caveat:** E1 (tokens/theme) must land first; Table cluster and
  Chart are the riskiest single items — assign a strong owner and start their
  design spikes during P3, not P4.

**Recommendation:** target **3 devs** as the planning baseline; 2 devs forces the
trim list and removes QA slack; 4 devs buys the complex-set design spikes running
in parallel with P3.
