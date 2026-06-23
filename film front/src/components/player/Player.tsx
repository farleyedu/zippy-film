import { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player';
import { usePlaybackProgress } from '../../hooks/usePlaybackProgress';
import type { PlaybackInfo } from '../../types/playback';
import { PlayerControls } from './PlayerControls';

export function Player({ info }: { info: PlaybackInfo }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>(() => {
    return localStorage.getItem('zippy.playerFitMode') === 'cover' ? 'cover' : 'contain';
  });
  const profileId = localStorage.getItem('zippy.profileId') ?? 'profile-farley';
  usePlaybackProgress(info.playableItemId, profileId, video);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    setVideo(element);
    let initialPositionApplied = false;

    const applyInitialPosition = () => {
      if (initialPositionApplied || !info.initialPositionSeconds || info.initialPositionSeconds < 5) return;
      const duration = element.duration || info.durationSeconds || 0;
      if (duration > 0 && info.initialPositionSeconds >= duration - 20) return;

      element.currentTime = info.initialPositionSeconds;
      initialPositionApplied = true;
    };

    const player = new shaka.Player(element);
    element.addEventListener('loadedmetadata', applyInitialPosition);

    player.load(info.hlsUrl).then(applyInitialPosition).catch(() => {
      if (info.directUrl) {
        element.src = info.directUrl;
        element.addEventListener('loadedmetadata', applyInitialPosition, { once: true });
        void element.play();
        return;
      }

      element.poster = 'https://picsum.photos/seed/zippy-player/1600/900';
    });

    const handleKey = (event: KeyboardEvent) => {
      setControlsVisible(true);
      if (event.code === 'Space') {
        event.preventDefault();
        if (element.paused) void element.play();
        else element.pause();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      element.removeEventListener('loadedmetadata', applyInitialPosition);
      void player.destroy();
    };
  }, [info.directUrl, info.durationSeconds, info.hlsUrl, info.initialPositionSeconds]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      if (!videoRef.current?.paused) {
        setControlsVisible(false);
      }
    }, 3200);
  };

  const toggleFitMode = () => {
    setFitMode((current) => {
      const next = current === 'contain' ? 'cover' : 'contain';
      localStorage.setItem('zippy.playerFitMode', next);
      return next;
    });
  };

  return (
    <section className={`watch-screen fit-${fitMode} ${controlsVisible ? 'controls-visible' : 'controls-hidden'}`} onMouseMove={showControls} onClick={showControls}>
      <video ref={videoRef} className="video-player" autoPlay playsInline onPlay={showControls} onPause={() => setControlsVisible(true)} />
      <PlayerControls info={info} video={video} fitMode={fitMode} onToggleFitMode={toggleFitMode} />
    </section>
  );
}
