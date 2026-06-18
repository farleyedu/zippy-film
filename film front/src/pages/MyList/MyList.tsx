import { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { ContentRow } from '../../components/layout/ContentRow';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function MyList() {
  const [items, setItems] = useState<Media[]>([]);

  useEffect(() => {
    api.favorites().then(setItems);
  }, []);

  return (
    <AppShell>
      <section className="catalog-page">
        <h1>Minha lista</h1>
        <ContentRow title="Favoritos do Jellyfin" items={items} />
      </section>
    </AppShell>
  );
}
