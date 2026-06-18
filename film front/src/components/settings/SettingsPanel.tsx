import type { ReactNode } from 'react';

export function SettingsPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
