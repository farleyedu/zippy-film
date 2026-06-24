import { Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FavoriteButton } from '../../components/actions/FavoriteButton';
import { EpisodeCard } from '../../components/cards/EpisodeCard';
import { AppShell } from '../../components/layout/AppShell';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function SeriesDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState<Media | null>(null);
  const season = media?.seasons?.[0];

  useEffect(() => {
    api.seriesDetail(id).then(setMedia);
  }, [id]);

  if (!media) return null;

  return (
    <AppShell>
      <section className="detail-page series-detail" style={{ backgroundImage: `linear-gradient(90deg, #050505 8%, rgba(5,5,5,.78) 48%, rgba(5,5,5,.25)), url(${media.backdropUrl})` }}>
        <div>
          <h1>{media.title}</h1>
          <p>{media.year} • {media.seasons?.length ?? 1} temporada • {media.genre}</p>
          <p className="detail-overview">{media.overview}</p>
          <div className="hero-actions">
            <button onClick={() => navigate(`/watch/${media.playableItemId ?? media.id}`)} tabIndex={0}><Play />Continuar episodio atual</button>
            <button className="secondary" tabIndex={0}><RotateCcw />Recomecar serie</button>
            <FavoriteButton mediaId={media.id} isFavorite={media.isFavorite} variant="pill" onChanged={(isFavorite) => setMedia({ ...media, isFavorite })} />
          </div>
        </div>
      </section>
      <section className="episode-section">
        <div className="filter-row"><button className="active" tabIndex={0}>{season?.title ?? 'Temporada 1'}</button></div>
        <div className="episode-list">
          {(season?.episodes ?? []).map((episode) => <EpisodeCard key={episode.id} episode={episode} />)}
        </div>
      </section>
    </AppShell>
  );
}
