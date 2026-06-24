import type { Media } from '../../types/media';
import { MediaCard } from '../cards/MediaCard';

export function ContentRow({
  title,
  items,
  wide = false,
  onFavoriteChanged
}: {
  title: string;
  items: Media[];
  wide?: boolean;
  onFavoriteChanged?: (mediaId: string, favorite: boolean) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="content-row">
      <h2>{title}</h2>
      <div className="row-scroller">
        {items.map((item) => <MediaCard key={item.id} media={item} wide={wide} onFavoriteChanged={onFavoriteChanged} />)}
      </div>
    </section>
  );
}
