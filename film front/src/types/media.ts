export type MediaType = 'MOVIE' | 'SERIES';

export type Media = {
  id: string;
  type: MediaType;
  title: string;
  year?: number;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  voteAverage?: number;
  status?: string;
  genre?: string;
  progress?: number;
  playableItemId?: string;
  seasons?: Season[];
  isFavorite?: boolean;
  runtimeSeconds?: number;
  officialRating?: string;
  childCount?: number;
};

export type Season = {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
};

export type Episode = {
  id: string;
  playableItemId: string;
  episodeNumber: number;
  title: string;
  overview: string;
  durationMinutes: number;
  stillUrl: string;
  progress?: number;
  isPlayed?: boolean;
};

export type HomeRow = {
  title: string;
  items: Media[];
};

export type HomeResponse = {
  hero: Media | null;
  rows: HomeRow[];
};
