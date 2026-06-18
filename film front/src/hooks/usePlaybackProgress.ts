import { useEffect } from 'react';
import { api } from '../services/api';

export function usePlaybackProgress(playableItemId: string | undefined, profileId: string | undefined, video: HTMLVideoElement | null) {
  useEffect(() => {
    if (!playableItemId || !profileId || !video) {
      return;
    }

    void api.reportStart(playableItemId);
    const save = () => api.saveProgress(playableItemId, profileId, Math.floor(video.currentTime), Math.floor(video.duration || 0));
    const stop = () => api.reportStopped(playableItemId, Math.floor(video.currentTime));
    const interval = window.setInterval(save, 10000);
    video.addEventListener('pause', save);
    video.addEventListener('ended', stop);
    window.addEventListener('beforeunload', stop);

    return () => {
      window.clearInterval(interval);
      void stop();
      video.removeEventListener('pause', save);
      video.removeEventListener('ended', stop);
      window.removeEventListener('beforeunload', stop);
    };
  }, [playableItemId, profileId, video]);
}
