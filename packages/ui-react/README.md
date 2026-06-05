# @acronis-platform/ui-react

The next-generation Acronis React component library — a **Base UI**
implementation, themed by [`@acronis-platform/tokens-pd`](../tokens-pd)
(generated from [`@acronis-platform/design-tokens`](../design-tokens)).

> Early days: this package is being built out component by component. See
> [`AGENTS.md`](./AGENTS.md) for conventions.

## Install

```sh
pnpm add @acronis-platform/ui-react react react-dom
```

## Usage

```tsx
import '@acronis-platform/ui-react/styles';
import { Button, Switch } from '@acronis-platform/ui-react';

export function Example() {
  return (
    <div>
      <Button variant="default">Save</Button>
      <Switch defaultChecked />
    </div>
  );
}
```

Toggle dark mode by adding the `dark` class to an ancestor element.

## Develop

```sh
pnpm --filter @acronis-platform/ui-react storybook   # explore components
pnpm --filter @acronis-platform/ui-react test        # Vitest + RTL
pnpm --filter @acronis-platform/ui-react build       # library bundle + types
```
