import { useNavigate } from 'react-router-dom';
import { FavoriteButton } from '../actions/FavoriteButton';
import type { Media } from '../../types/media';

export function MediaCard({
  media,
  wide = false,
  onFavoriteChanged
}: {
  media: Media;
  wide?: boolean;
  onFavoriteChanged?: (mediaId: string, favorite: boolean) => void;
}) {
  const navigate = useNavigate();
  const path = wide && media.playableItemId ? `/watch/${media.playableItemId}` : media.type === 'MOVIE' ? `/movie/${media.id}` : `/series/${media.id}`;
  const open = () => navigate(path);

  return (
    <div
      className={`media-card ${wide ? 'wide-card' : ''}`}
      role="button"
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      }}
      tabIndex={0}
    >
      <div className="media-card-art">
        <img src={wide ? media.backdropUrl : media.posterUrl} alt={media.title} />
        <FavoriteButton
          mediaId={media.id}
          isFavorite={media.isFavorite}
          variant="card"
          onChanged={(favorite) => onFavoriteChanged?.(media.id, favorite)}
        />
      </div>
      <div className="media-card-meta">
        <span>{media.title}</span>
        <small>{media.year} / {media.genre ?? media.type}</small>
      </div>
      {typeof media.progress === 'number' && <i style={{ width: `${media.progress}%` }} />}
    </div>
  );
}
