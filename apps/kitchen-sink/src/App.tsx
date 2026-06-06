import { useEffect, useState, type ReactNode } from 'react';

import {
  applyBrand,
  applyTheme,
  brandOverrideCount,
  BRANDS,
  DEFAULT_BRAND,
  type Brand,
  type ColorMode,
} from '@/lib/tokens';
import { ColorsSection } from '@/sections/colors';
import { ComponentsSection } from '@/sections/components';
import { IconsSection } from '@/sections/icons';
import { TypographySection } from '@/sections/typography';

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 56, scrollMarginTop: 72 }}>
      <h2
        style={{
          fontSize: 20,
          marginBottom: 20,
          paddingBottom: 8,
          borderBottom: '1px solid var(--ui-border-on-surface-divider)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

const SECTIONS = [
  { id: 'colors', title: 'Colors & tokens', Component: ColorsSection },
  { id: 'typography', title: 'Typography', Component: TypographySection },
  { id: 'components', title: 'Components', Component: ComponentsSection },
  { id: 'icons', title: 'Icons', Component: IconsSection },
];

export default function App() {
  const [mode, setMode] = useState<ColorMode>('light');
  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);

  // Light/dark drives the tokens' `light-dark()` via `color-scheme`.
  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  // A brand applies its `:root` override stylesheet (brand-b) or removes it.
  useEffect(() => {
    applyBrand(brand);
  }, [brand]);

  // How many tokens the selected brand overrides vs the default — 0 means the
  // brand renders identically to the default.
  const overrides = brandOverrideCount(brand);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--ui-background-surface-primary)',
        color: 'var(--ui-text-on-surface-primary)',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '12px 24px',
          background: 'var(--ui-background-surface-primary)',
          borderBottom: '1px solid var(--ui-border-on-surface-divider)',
        }}
      >
        <strong>Acronis UI — Kitchen Sink</strong>
        <nav
          style={{ display: 'flex', gap: 16, marginLeft: 'auto', fontSize: 13 }}
        >
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{ color: 'var(--ui-text-on-surface-link)' }}
            >
              {s.title}
            </a>
          ))}
        </nav>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
          }}
        >
          Brand
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value as Brand)}
            style={{
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--ui-border-on-surface-border)',
              background: 'var(--ui-background-surface-secondary)',
              color: 'inherit',
            }}
          >
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <span style={{ color: 'var(--ui-text-on-surface-secondary)' }}>
            {brand === DEFAULT_BRAND
              ? '(default)'
              : `(${overrides} override${overrides === 1 ? '' : 's'})`}
          </span>
        </label>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            border: '1px solid var(--ui-border-on-surface-border)',
            background: 'var(--ui-background-surface-secondary)',
            color: 'inherit',
          }}
        >
          {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </header>

      <main
        style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 96px' }}
      >
        {SECTIONS.map(({ id, title, Component }) => (
          <Section key={id} id={id} title={title}>
            <Component />
          </Section>
        ))}
      </main>
    </div>
  );
}
