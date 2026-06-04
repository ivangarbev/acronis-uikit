import { useEffect, useState, type ReactNode } from 'react';

import { ColorsSection } from '@/sections/colors';
import { ComponentsSection } from '@/sections/components';
import { ElementsSection } from '@/sections/elements';
import { IconsSection } from '@/sections/icons';

type ColorMode = 'light' | 'dark';

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
          borderBottom: '1px solid var(--av-colors-border-on-surface-divider)',
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
  { id: 'elements', title: 'Default elements', Component: ElementsSection },
  { id: 'components', title: 'Components', Component: ComponentsSection },
  { id: 'icons', title: 'Icons', Component: IconsSection },
];

export default function App() {
  const [mode, setMode] = useState<ColorMode>('light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--av-colors-background-surface-primary)',
        color: 'var(--av-colors-text-on-surface-primary)',
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
          background: 'var(--av-colors-background-surface-primary)',
          borderBottom: '1px solid var(--av-colors-border-on-surface-divider)',
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
              style={{ color: 'var(--av-colors-text-on-surface-link)' }}
            >
              {s.title}
            </a>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => setMode((m) => (m === 'light' ? 'dark' : 'light'))}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer',
            border: '1px solid var(--av-colors-border-on-surface-border)',
            background: 'var(--av-colors-background-surface-secondary)',
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
