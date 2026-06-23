export type PlaybackEpisode = {
  id: string;
  title: string;
  seasonNumber?: number;
  episodeNumber?: number;
  durationMinutes?: number;
  progress?: number;
  isPlayed?: boolean;
};

export type PlaybackTrackOption = {
  id: string;
  label: string;
  language?: string;
  index?: number;
  codec?: string;
  channels?: number;
  isDefault?: boolean;
  isForced?: boolean;
};

export type PlaybackQualityOption = {
  id: string;
  label: string;
  height?: number;
  bitrate?: number;
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
  qualities: PlaybackQualityOption[];
  audioTracks: PlaybackTrackOption[];
  subtitleTracks: PlaybackTrackOption[];
  episodes?: PlaybackEpisode[];
  nextEpisodeId?: string;
};
