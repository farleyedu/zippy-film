export type PlaybackInfo = {
  playableItemId: string;
  title: string;
  hlsUrl: string;
  directUrl?: string;
  durationSeconds: number;
  qualities: string[];
  audioTracks: string[];
  subtitleTracks: string[];
};
