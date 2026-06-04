import { Button, Switch } from '@acronis-platform/ui-react';
import {
  ChevronDownIcon,
  PlusIcon,
} from '@acronis-platform/icons-react/stroke-mono';

const BUTTON_VARIANTS = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
  'translucent',
] as const;

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        style={{
          fontSize: 12,
          color: 'var(--av-colors-text-on-surface-secondary)',
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function ComponentsSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h3 style={{ marginBottom: 12 }}>Button</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Row label="Variants">
            {BUTTON_VARIANTS.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
          </Row>
          <Row label="With icons">
            <Button>
              <PlusIcon /> Add item
            </Button>
            <Button variant="secondary">
              Options <ChevronDownIcon />
            </Button>
          </Row>
          <Row label="States">
            <Button disabled>Disabled</Button>
          </Row>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: 12 }}>Switch</h3>
        <Row label="States">
          <Switch aria-label="Off" />
          <Switch aria-label="On" defaultChecked />
          <Switch aria-label="Disabled off" disabled />
          <Switch aria-label="Disabled on" disabled defaultChecked />
        </Row>
      </div>
    </div>
  );
}
