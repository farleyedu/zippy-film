import { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { MediaCard } from '../../components/cards/MediaCard';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function History() {
  const [items, setItems] = useState<Media[]>([]);

  useEffect(() => {
    api.history().then(setItems);
  }, []);

  return (
    <AppShell>
      <section className="catalog-page">
        <h1>Historico</h1>
        {items.length ? (
          ['Assistidos', 'Com progresso', 'Recentes'].map((group, index) => (
            <section className="content-row" key={group}>
              <h2>{group}</h2>
              <div className="row-scroller">{items.slice(index * 12, index * 12 + 12).map((item) => <MediaCard key={`${group}-${item.id}`} media={item} />)}</div>
            </section>
          ))
        ) : (
          <div className="empty-feature-state">
            <strong>Historico vazio</strong>
            <p>Os itens assistidos e com progresso do Jellyfin aparecem aqui conforme voce usa o player.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
