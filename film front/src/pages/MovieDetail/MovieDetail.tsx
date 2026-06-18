import { Play, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function MovieDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media | null>(null);

  useEffect(() => {
    api.media(id).then(setMedia);
  }, [id]);

  if (!media) return null;

  return (
    <AppShell>
      <section className="detail-page" style={{ backgroundImage: `linear-gradient(90deg, #050505 8%, rgba(5,5,5,.78) 48%, rgba(5,5,5,.25)), url(${media.backdropUrl})` }}>
        <div>
          <h1>{media.title}</h1>
          <p>{media.year} • {media.officialRating ?? 'Livre'} • {Math.round((media.runtimeSeconds ?? 0) / 60) || '--'} min • {media.genre ?? 'Video'} • Jellyfin</p>
          <p className="detail-overview">{media.overview}</p>
          <p>Elenco: Farley Silva, Marina Costa, Rafael Nunes</p>
          <p>Direcao: Zippy Studios</p>
          <div className="hero-actions">
            <button onClick={() => navigate(`/watch/${media.playableItemId ?? media.id}`)} tabIndex={0}><Play />Assistir</button>
            <button className="secondary" tabIndex={0}><RotateCcw />Recomecar</button>
            <button className="secondary" onClick={() => api.addList(localStorage.getItem('zippy.profileId') ?? '', media.id, 'FAVORITE')} tabIndex={0}><Plus />Favorito</button>
            <button className="secondary" tabIndex={0}>Assistir mais tarde</button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
