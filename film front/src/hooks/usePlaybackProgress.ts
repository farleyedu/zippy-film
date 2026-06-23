import { useEffect } from 'react';
import { api } from '../services/api';
import { clearStoredPlaybackProgress, saveStoredPlaybackProgress } from '../services/playbackProgressStore';

export function usePlaybackProgress(playableItemId: string | undefined, profileId: string | undefined, video: HTMLVideoElement | null) {
  useEffect(() => {
    if (!playableItemId || !profileId || !video) {
      return;
    }

    const current = () => Math.floor(video.currentTime || 0);
    const duration = () => Math.floor(video.duration || 0);
    const save = (isPaused = video.paused) => {
      if (current() <= 0) return Promise.resolve();
      saveStoredPlaybackProgress(playableItemId, current(), duration());
      return api.saveProgress(playableItemId, profileId, current(), duration(), isPaused);
    };
    const stop = () => {
      const position = current();
      const total = duration();
      if (total > 0 && position >= total - 20) {
        clearStoredPlaybackProgress(playableItemId);
      } else {
        saveStoredPlaybackProgress(playableItemId, position, total);
      }

      return save(true).finally(() => api.reportStopped(playableItemId, position));
    };
    const start = () => {
      void api.reportStart(playableItemId, current());
    };
    const interval = window.setInterval(() => {
      if (!video.paused && current() > 0) void save(false);
    }, 3000);
    const onPause = () => void save(true);
    const onSeeked = () => void save(video.paused);
    const onEnded = () => void stop();
    const onPageHidden = () => {
      if (document.visibilityState === 'hidden' && current() > 0) void stop();
    };
    const onPageHide = () => {
      if (current() > 0) void stop();
    };

    video.addEventListener('play', start);
    video.addEventListener('pause', onPause);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('ended', onEnded);
    document.addEventListener('visibilitychange', onPageHidden);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(interval);
      if (current() > 0) void stop();
      video.removeEventListener('play', start);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', onEnded);
      document.removeEventListener('visibilitychange', onPageHidden);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [playableItemId, profileId, video]);
}
