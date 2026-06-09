# @acronis-platform/ui-spec

Framework-agnostic component specifications for the Acronis UI Kit. Each spec
describes a component's contract, anatomy, states, behavior, accessibility, and
the design tokens it consumes — independent of any rendering framework, so a
single definition can drive the React implementation today and Vue / Web
Component implementations in the future.

> **Status: Phase 0 spike.** Private package. Covers three components
> (`button`, `button-icon`, `switch`) to validate the format and its conformance
> check. See [`packages/design-grammar/context/component-specs-proposal.md`](../design-grammar/context/component-specs-proposal.md).

## Layout

```
packages/ui-spec/
├── index.ts                 # component registry + spec loader + types
├── types.ts                 # TypeScript interfaces for the YAML shapes
├── schema/                  # JSON Schemas for the four YAML files
├── lib/                     # spec loader + cva-key extractor (used by tests)
├── __tests__/specs.test.ts  # schema validation + cva↔contract conformance
└── components/<name>/        # the 7-file spec per component
```

## Use

```sh
pnpm --filter @acronis-platform/ui-spec test   # validate + conformance
```

```ts
import { components, loadSpec } from '@acronis-platform/ui-spec';

components; // [{ name: 'button', component: 'Button', status, category }, ...]
const button = loadSpec('button'); // { index, anatomy, api, tokens }
button.api.contract.properties; // queryable, framework-agnostic contract
```

See [`AGENTS.md`](AGENTS.md) for the 7-file format, the tokens-by-reference rule,
and how conformance works.
