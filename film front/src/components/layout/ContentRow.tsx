import type { Media } from '../../types/media';
import { MediaCard } from '../cards/MediaCard';

export function ContentRow({ title, items }: { title: string; items: Media[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="content-row">
      <h2>{title}</h2>
      <div className="row-scroller">
        {items.map((item) => <MediaCard key={item.id} media={item} />)}
      </div>
    </section>
  );
}
