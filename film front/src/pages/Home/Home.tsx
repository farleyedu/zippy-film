import { useEffect, useState } from 'react';
import { ContentRow } from '../../components/layout/ContentRow';
import { HeroBanner } from '../../components/layout/HeroBanner';
import { AppShell } from '../../components/layout/AppShell';
import { LoadingScreen } from '../../components/layout/LoadingScreen';
import { api } from '../../services/api';
import type { HomeResponse } from '../../types/media';

export function Home() {
  const [home, setHome] = useState<HomeResponse | null>(null);

  useEffect(() => {
    api.home().then(setHome);
  }, []);

  if (!home) return <LoadingScreen />;

  return (
    <AppShell>
      <HeroBanner media={home.hero} />
      <div className="rows-stack">
        {home.rows.map((row) => <ContentRow key={row.title} title={row.title} items={row.items} />)}
      </div>
    </AppShell>
  );
}
