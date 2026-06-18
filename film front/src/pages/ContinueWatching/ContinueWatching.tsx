import { useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { MediaCard } from '../../components/cards/MediaCard';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function ContinueWatching() {
  const [items, setItems] = useState<Media[]>([]);

  useEffect(() => {
    api.continueWatching().then(setItems);
  }, []);

  return (
    <AppShell>
      <section className="catalog-page">
        <h1>Continuar assistindo</h1>
        {items.length ? (
          <div className="media-grid wide-grid">{items.map((item) => <MediaCard key={item.id} media={item} wide />)}</div>
        ) : (
          <div className="empty-feature-state">
            <strong>Nada em andamento</strong>
            <p>Quando voce pausar um filme ou episodio, o Jellyfin salva o progresso e ele aparece aqui.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
