import type { Media } from '../../types/media';
import { MediaCard } from './MediaCard';

export function SeriesCard({ media }: { media: Media }) {
  return <MediaCard media={media} />;
}
