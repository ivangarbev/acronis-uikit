# P2 — Tier 1 primitives — board-ready breakdown

> Phase P2 of [roadmap.md](./roadmap.md). Target: **Jun–Jul 2026**.
> These unblock most of Tier 2/3 and are locked regardless of capacity/scope
> decisions, so work can start now. Capacity allocation across 2–4 devs: TBD.

## Conventions (apply to every task)

- **Location:** `packages/ui-react/src/components/ui/<component>/` per the layout
  in `packages/ui-react/AGENTS.md` (`<component>.tsx`, `index.ts`, `__tests__/`,
  `__stories__/`, optional `<component>.figma.tsx`).
- **Primitive source:** Base UI (`@base-ui/react`) — no Radix. Compose with
  `useRender` + `mergeProps` (the `render` prop), not `asChild`/`Slot`.
- **Variants:** `class-variance-authority`, exposed via `VariantProps`; classes
  merged with `cn()`.
- **Theming:** style only with Tailwind utilities mapped to `--av-*` (via
  `@theme inline`). No hand-authored color values.
- **Definition of Done (DoD)** — every task:
  1. Component to spec with typed public props at the boundary.
  2. Vitest + RTL test in `__tests__/`.
  3. Storybook story in `__stories__/` — **all variants/states, light + dark**.
  4. Changeset (`pnpm changeset`).
  5. a11y pass: keyboard, focus-visible, ARIA wired, contrast.
  6. (Optional) `<component>.figma.tsx` Code Connect mapping.
- **Estimate key:** S ≈ ≤1 day · M ≈ 1–2 days · L ≈ 3–4 days (incl. tests/stories).

## Dependency graph (within P2)

```
Input ─┐
Label ─┼─► Field ─► (Tier 2 form composites, Form)
Textarea┘
Checkbox        (standalone; Field-compatible)
Radio Group     (standalone; Field-compatible)
Separator       (standalone)
Popover ─► (Tier 2 Dropdown, Combobox, Select polish)
Tooltip         (standalone; portal escape hatch → unblocks Table #47)
Dialog          (standalone)
Select  ─ depends on Popover-style positioning (Base UI Select is self-contained)
```

Suggested first wave (no deps): **Input, Label, Separator, Checkbox, Tooltip**.
Second wave: **Textarea, Field, Radio Group, Popover, Dialog, Select**.

---

## Tasks

### T1.1 — Input · S

- **Base UI:** `Input`.
- **Scope:** sizes (sm/md/lg), states (default/disabled/invalid/readonly),
  optional leading/trailing adornment slots. Controlled + uncontrolled.
- **a11y:** associates with Field/Label; `aria-invalid` on error.
- **DoD** as above. **Deps:** none.

### T1.2 — Label · S

- **Base UI:** none standalone — use Field's `Field.Label` semantics; provide a
  thin styled `Label` for use outside Field.
- **Scope:** required-indicator, disabled styling, `htmlFor` wiring.
- **Deps:** none. Pairs with Field.

### T1.3 — Textarea · S

- **Base UI:** no dedicated primitive — styled native `<textarea>`, Field-compatible.
- **Scope:** sizes, auto-resize option, states matching Input.
- **Deps:** none (shares state styling with Input — build after Input for parity).

### T1.4 — Field · M

- **Base UI:** `Field` (+ `Field.Label`, `Field.Description`, `Field.Error`,
  `Field.Control`).
- **Scope:** label + description + validation/error message wiring for any control
  (Input, Textarea, Select, Checkbox, Radio). The composition contract every Tier 2
  form component plugs into.
- **a11y:** `aria-describedby`/`aria-errormessage` wiring; error announced.
- **Deps:** Input, Label (validates the contract against real controls).

### T1.5 — Checkbox · M

- **Base UI:** `Checkbox` (+ `Checkbox.Indicator`); consider `CheckboxGroup`.
- **Scope:** checked/unchecked/**indeterminate**, disabled, invalid; sizes.
  Indeterminate matters for Table row-selection later.
- **Deps:** none. Field-compatible.

### T1.6 — Radio Group · M

- **Base UI:** `RadioGroup` + `Radio` (+ `Radio.Indicator`).
- **Scope:** orientation (vertical/horizontal), disabled (group + item), invalid.
- **Deps:** none. Field-compatible.

### T1.7 — Separator · S

- **Base UI:** `Separator`.
- **Scope:** horizontal/vertical, decorative vs semantic (`role`/`aria-orientation`).
- **Deps:** none. Used by menus, toolbars, layout.

### T1.8 — Popover · M

- **Base UI:** `Popover` (Trigger/Positioner/Popup/Arrow).
- **Scope:** placement, offset, collision handling, controlled open, modal vs
  non-modal, focus management on open/close.
- **a11y:** focus trap when modal; `aria-expanded` on trigger; ESC/outside-click close.
- **Deps:** none. **Unblocks:** Dropdown Menu, Combobox, Select polish (Tier 2).

### T1.9 — Tooltip · M _(includes #47)_

- **Base UI:** `Tooltip` (Trigger/Positioner/Popup/Arrow).
- **Scope:** placement, delay, controlled open. **Portal escape hatch** — allow
  rendering into a custom container instead of always `document.body` (**fixes #47**,
  which the Table column header needs).
- **a11y:** `role="tooltip"`, `aria-describedby` wiring, hover + focus triggers.
- **Deps:** none. **Unblocks:** Table sort header (#48).

### T1.10 — Dialog · M

- **Base UI:** `Dialog` (Trigger/Portal/Backdrop/Popup/Title/Description/Close).
- **Scope:** sizes, controlled open, focus trap + restore, scroll lock,
  ESC/backdrop close toggles. (Alert Dialog can follow in Tier 2.)
- **a11y:** `role="dialog"` + `aria-modal`, labelled by Title, described by Description.
- **Deps:** none (Base UI Dialog is self-contained).

### T1.11 — Select · L

- **Base UI:** `Select` (Trigger/Value/Icon/Positioner/Popup/Item/ItemIndicator/Group/
  GroupLabel).
- **Scope:** single select (multi later if needed), grouped options, disabled items,
  placeholder, invalid state, keyboard typeahead. Field-compatible.
- **a11y:** full listbox semantics, keyboard nav, selected announcement.
- **Deps:** benefits from Popover positioning patterns — schedule after Popover.

---

## P2 rollup

| Task                | Est | Deps         |
| ------------------- | --- | ------------ |
| T1.1 Input          | S   | —            |
| T1.2 Label          | S   | —            |
| T1.3 Textarea       | S   | (Input)      |
| T1.4 Field          | M   | Input, Label |
| T1.5 Checkbox       | M   | —            |
| T1.6 Radio Group    | M   | —            |
| T1.7 Separator      | S   | —            |
| T1.8 Popover        | M   | —            |
| T1.9 Tooltip (+#47) | M   | —            |
| T1.10 Dialog        | M   | —            |
| T1.11 Select        | L   | (Popover)    |

**Rough total:** ~4×S + 6×M + 1×L ≈ **18–22 dev-days**. With 2–4 devs working
the two waves in parallel, P2 fits a **~3–4 week window** — consistent with the
Jun–Jul slot and the early-July consumer drop (which needs Input/Label/Field/
Checkbox/Select + Tooltip/Dialog at minimum).
