import { useMemo } from 'react';

import { readTokenNames, resolveToken, type Token } from '@/lib/tokens';

function Swatch({ name }: { name: string }) {
  const value = resolveToken(name);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}
    >
      <div
        style={{
          height: 40,
          borderRadius: 6,
          background: `var(${name})`,
          border: '1px solid var(--av-colors-border-on-surface-border)',
        }}
      />
      <code
        style={{
          fontSize: 10,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name.replace('--av-', '')}
      </code>
      <span
        style={{
          fontSize: 10,
          color: 'var(--av-colors-text-on-surface-secondary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ColorsSection() {
  const groups = useMemo(() => {
    const out: Record<string, Token[]> = {};
    for (const token of readTokenNames()) (out[token.group] ??= []).push(token);
    return Object.entries(out);
  }, []);

  if (groups.length === 0) {
    return (
      <p>
        No <code>--av-*</code> tokens found in the loaded stylesheets.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {groups.map(([group, tokens]) => (
        <div key={group}>
          <h3
            style={{
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              opacity: 0.6,
            }}
          >
            {group} <span style={{ fontWeight: 400 }}>({tokens.length})</span>
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 12,
            }}
          >
            {tokens.map((token) => (
              <Swatch key={token.name} name={token.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
