# Project board — operating model

> How we run **GitHub Project #3** ("User Interface Kit Development") for the
> roadmap in [`roadmap.md`](./roadmap.md). Read this before triaging or moving
> work. Last updated: 2026-06-05.

## Epics vs tasks

- **Epics (#102–108)** are _containers_, not work items. Nobody "does" an epic;
  its sub-issues roll up a progress bar automatically. They carry the
  `epic` + `epic:E#-*` labels and are **filtered off the dev boards** (`-label:epic`)
  so they don't masquerade as tasks. Watch them in the **Epics Overview** view.
- **Tasks** are the leaf issues (one per component / decision / chore). Each is
  linked as a **sub-issue** of its epic, so the _Parent issue_ field gives the
  hierarchy for free.
- **One task = one component = one PR = one changeset** (matches the per-component
  DoD in `packages/ui-react/AGENTS.md`).

## Status lifecycle

| Status          | Means                            | Entry gate                     |
| --------------- | -------------------------------- | ------------------------------ |
| **Backlog**     | Known, not yet ready             | has Epic + Phase               |
| **Ready**       | Groomed, unblocked, pick-up-able | + Size + Priority + deps clear |
| **In progress** | Being built                      | + Assignee + in an Iteration   |
| **In review**   | PR open                          | linked PR                      |
| **Done**        | Merged                           | PR merged + changeset          |

## Working rules

- **Respect Phase order + dependencies** when promoting Backlog → Ready. E.g. don't
  start Field before Input/Label; don't start the Table cluster before
  Tooltip/Checkbox/Scroll Area ship.
- **Decisions block their phase.** Ratify `decision`-labelled issues before the
  dependent phase starts — #192 (RSC support, **Priority P0-Critical**) before P2
  primitive detail.
- **Capacity split (2 FT + 2 PT ≈ 3 FTE):** part-timers take S/M leaf tasks
  (widgets, layout, docs); full-timers own the critical path (E1 tokens, then
  Select/Combobox/Table cluster/Chart).
- **Trim lever:** if v1 gets tight, cut the widget family + extra layout templates
  first (tagged "Trim buffer/candidate" in their issue bodies) — never slip the date.

## Fields

| Field         | Values                                           | Use                                              |
| ------------- | ------------------------------------------------ | ------------------------------------------------ |
| **Status**    | Backlog · Ready · In progress · In review · Done | Lifecycle                                        |
| **Phase**     | P1-Foundation … P5-GA                            | Delivery sequence                                |
| **Priority**  | P0-Critical · P1-High · P2-Medium · P3-Low       | What to pull next                                |
| **Size**      | XS–XL                                            | Estimate (≈ XS<½d, S≤1d, M 1–2d, L 3–4d, XL 5d+) |
| **Iteration** | 14-day sprints                                   | Sprint commitment                                |

## Views

| View                    | Layout  | Group by     | Filter                             | Purpose                                                        |
| ----------------------- | ------- | ------------ | ---------------------------------- | -------------------------------------------------------------- |
| **Dev Board**           | Board   | Status       | `-label:epic` + current iteration  | Daily kanban                                                   |
| **Epics Overview**      | Table   | —            | `label:epic`                       | 7-row health (Sub-issues progress + Status + Priority columns) |
| **By Epic**             | Table   | Parent issue | `-label:epic`                      | Epic → task hierarchy                                          |
| **By Phase**            | Board   | Phase        | `-label:epic`                      | P1→P5 pipeline                                                 |
| **Prioritized backlog** | Board   | Priority     | `status:Backlog,Ready -label:epic` | Grooming / what's next                                         |
| **Roadmap**             | Roadmap | Phase        | `-label:epic`                      | Timeline (date markers = Iteration)                            |

## Automation (Project → Settings → Workflows — UI only)

Enable these built-in workflows (not settable via API):

1. **Auto-add** — add newly-opened `acronis/uikit` issues to the project.
2. **Item closed → Status: Done.**
3. **Pull request merged → Status: Done** (for the linked issue).
4. **Auto-archive items** — `Status is Done` AND `updated > 2 weeks ago`. Keeps the
   board to active work; clears merged-PR noise automatically.

## Sprint cadence

14-day Iterations. In sprint planning, pull the top of **Prioritized backlog** into
the current Iteration, respecting Phase order + deps. First sprint = the Ready P2
primitives (Input, Label, Checkbox, Separator, Tooltip) + the E1 theme tasks.
