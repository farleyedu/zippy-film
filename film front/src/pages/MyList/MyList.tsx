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
        {items.length ? (
          <ContentRow title="Favoritos do Jellyfin" items={items} />
        ) : (
          <div className="empty-feature-state">
            <strong>Sua lista ainda esta vazia</strong>
            <p>Marque filmes e series como favoritos no Zippy ou no Jellyfin para eles aparecerem aqui.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
