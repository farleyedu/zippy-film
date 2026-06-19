export type PlaybackEpisode = {
  id: string;
  title: string;
  seasonNumber?: number;
  episodeNumber?: number;
  durationMinutes?: number;
  progress?: number;
  isPlayed?: boolean;
};

export type PlaybackInfo = {
  playableItemId: string;
  title: string;
  displayTitle?: string;
  seriesTitle?: string;
  hlsUrl: string;
  directUrl?: string;
  durationSeconds: number;
  initialPositionSeconds?: number;
  qualities: string[];
  audioTracks: string[];
  subtitleTracks: string[];
  episodes?: PlaybackEpisode[];
  nextEpisodeId?: string;
};
