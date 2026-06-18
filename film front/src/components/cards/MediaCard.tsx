import { useNavigate } from 'react-router-dom';
import type { Media } from '../../types/media';

export function MediaCard({ media, wide = false }: { media: Media; wide?: boolean }) {
  const navigate = useNavigate();
  const path = media.type === 'MOVIE' ? `/movie/${media.id}` : `/series/${media.id}`;

  return (
    <button className={`media-card ${wide ? 'wide-card' : ''}`} onClick={() => navigate(path)} tabIndex={0}>
      <div className="media-card-art">
        <img src={wide ? media.backdropUrl : media.posterUrl} alt={media.title} />
        {media.isFavorite && <b>Favorito</b>}
      </div>
      <div className="media-card-meta">
        <span>{media.title}</span>
        <small>{media.year} / {media.genre ?? media.type}</small>
      </div>
      {typeof media.progress === 'number' && <i style={{ width: `${media.progress}%` }} />}
    </button>
  );
}
