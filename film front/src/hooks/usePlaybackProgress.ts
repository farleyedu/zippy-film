import { useEffect } from 'react';
import { api } from '../services/api';

export function usePlaybackProgress(playableItemId: string | undefined, profileId: string | undefined, video: HTMLVideoElement | null) {
  useEffect(() => {
    if (!playableItemId || !profileId || !video) {
      return;
    }

    const current = () => Math.floor(video.currentTime || 0);
    const duration = () => Math.floor(video.duration || 0);
    const save = (isPaused = video.paused) => {
      if (current() <= 0) return Promise.resolve();
      return api.saveProgress(playableItemId, profileId, current(), duration(), isPaused);
    };
    const stop = () => api.reportStopped(playableItemId, Math.floor(video.currentTime));
    const start = () => {
      void api.reportStart(playableItemId, current());
    };
    const interval = window.setInterval(() => {
      if (!video.paused && current() > 0) void save(false);
    }, 5000);
    const onPause = () => void save(true);
    const onSeeked = () => void save(video.paused);
    const onEnded = () => void stop();
    const onBeforeUnload = () => void stop();

    video.addEventListener('play', start);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('ended', onEnded);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.clearInterval(interval);
      if (current() > 0) void stop();
      video.removeEventListener('play', start);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', onEnded);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [playableItemId, profileId, video]);
}
