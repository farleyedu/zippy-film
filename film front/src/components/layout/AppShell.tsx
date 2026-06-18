import type { ReactNode } from 'react';
import { TopNavigation } from './TopNavigation';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <TopNavigation />
      <main>{children}</main>
    </div>
  );
}
