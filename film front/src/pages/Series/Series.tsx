import { useEffect, useState } from 'react';
import { SeriesCard } from '../../components/cards/SeriesCard';
import { AppShell } from '../../components/layout/AppShell';
import { ContentRow } from '../../components/layout/ContentRow';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function Series() {
  const [items, setItems] = useState<Media[]>([]);

  useEffect(() => {
    api.series().then(setItems);
  }, []);

  return (
    <AppShell>
      <section className="catalog-page">
        <h1>Series</h1>
        <ContentRow title="Continuar series" items={items.filter((item) => item.progress)} />
        <div className="media-grid">{items.map((item) => <SeriesCard key={item.id} media={item} />)}</div>
      </section>
    </AppShell>
  );
}
