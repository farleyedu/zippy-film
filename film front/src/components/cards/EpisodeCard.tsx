import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Episode } from '../../types/media';

export function EpisodeCard({ episode }: { episode: Episode }) {
  const navigate = useNavigate();

  return (
    <button className="episode-card" onClick={() => navigate(`/watch/${episode.playableItemId}`)} tabIndex={0}>
      <img src={episode.stillUrl} alt={episode.title} />
      <strong>{episode.episodeNumber}. {episode.title}</strong>
      <span>{episode.durationMinutes} min</span>
      <p>{episode.overview}</p>
      <Play size={28} />
      {typeof episode.progress === 'number' && <i style={{ width: `${episode.progress}%` }} />}
    </button>
  );
}
