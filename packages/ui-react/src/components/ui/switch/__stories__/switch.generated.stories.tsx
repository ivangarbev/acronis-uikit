// AUTO-GENERATED from @acronis-platform/ui-spec — DO NOT EDIT.
// Regenerate: pnpm --filter @acronis-platform/ui-spec generate:stories
// `:hover` / `:active` stories require a Storybook pseudo-states addon to paint.

import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';
import { Switch } from '../switch';

const meta = {
  title: 'UI/Switch/All States (generated)',
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <Switch aria-label="Off" />
      <Switch aria-label="On" defaultChecked />
      <Switch aria-label="Disabled off" disabled />
      <Switch aria-label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const FocusVisible: Story = {
  render: () => <Switch aria-label="Toggle" />,
  // Real keyboard focus — paints :focus-visible without a pseudo-states addon.
  play: async () => {
    await userEvent.tab();
  },
};

// Internal state "checked" — click / Space / Enter toggles it (when uncontrolled).
export const Interaction: Story = {
  render: () => <Switch aria-label="Toggle" />,
  play: async ({ canvasElement }) => {
    const el = canvasElement.querySelector('[role="switch"]');
    if (el) await userEvent.click(el as HTMLElement);
  },
};
