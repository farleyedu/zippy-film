import { Info, ListPlus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Media } from '../../types/media';

export function HeroBanner({ media }: { media: Media | null }) {
  const navigate = useNavigate();
  if (!media) {
    return <section className="hero empty-hero" />;
  }

  const detailPath = media.type === 'MOVIE' ? `/movie/${media.id}` : `/series/${media.id}`;

  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, #050505 8%, rgba(5,5,5,.72) 44%, rgba(5,5,5,.1)), linear-gradient(0deg, #050505 0%, rgba(5,5,5,0) 30%), url(${media.backdropUrl})` }}>
      <div className="hero-copy">
        <p>{media.genre ?? 'Zippy Original'}</p>
        <h1>{media.title}</h1>
        <span>{media.year} • {media.voteAverage?.toFixed(1) ?? 'Novo'} • 4K</span>
        <p className="hero-overview">{media.overview}</p>
        <div className="hero-actions">
          <button onClick={() => navigate(`/watch/${media.playableItemId ?? media.id}`)} tabIndex={0}><Play size={26} fill="currentColor" />Assistir</button>
          <button className="secondary" onClick={() => navigate(detailPath)} tabIndex={0}><Info size={26} />Mais informacoes</button>
          <button className="icon-only" title="Minha lista" tabIndex={0}><ListPlus size={28} /></button>
        </div>
      </div>
    </section>
  );
}
