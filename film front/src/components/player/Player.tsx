import { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player';
import { useNavigate } from 'react-router-dom';
import { usePlaybackProgress } from '../../hooks/usePlaybackProgress';
import type { PlaybackInfo, PlaybackQualityOption } from '../../types/playback';
import { PlayerControls } from './PlayerControls';

type ShakaVariantTrack = {
  id: number;
  height?: number;
  bandwidth?: number;
  active?: boolean;
};

type ManagedShakaPlayer = {
  load: (source: string) => Promise<unknown>;
  destroy: () => Promise<unknown>;
  configure: (config: { abr: { enabled: boolean } }) => void;
  getVariantTracks: () => ShakaVariantTrack[];
  selectVariantTrack: (track: ShakaVariantTrack, clearBuffer?: boolean) => void;
  selectAudioLanguage: (language: string) => void;
  selectTextLanguage: (language: string) => void;
  setTextTrackVisibility: (visible: boolean) => void;
};

export function Player({ info }: { info: PlaybackInfo }) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const playerRef = useRef<ManagedShakaPlayer | null>(null);
  const nextTimerRef = useRef<number | null>(null);
  const nextIntervalRef = useRef<number | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsLocked, setControlsLocked] = useState(false);
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>(() => {
    return localStorage.getItem('zippy.playerFitMode') === 'cover' ? 'cover' : 'contain';
  });
  const [qualityOptions, setQualityOptions] = useState<PlaybackQualityOption[]>(info.qualities);
  const [selectedQualityId, setSelectedQualityId] = useState('auto');
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState(info.audioTracks.find((track) => track.isDefault)?.id ?? info.audioTracks[0]?.id ?? 'audio-default');
  const [selectedSubtitleTrackId, setSelectedSubtitleTrackId] = useState(info.subtitleTracks.find((track) => track.isDefault)?.id ?? 'off');
  const [playbackRate, setPlaybackRate] = useState(() => Number(localStorage.getItem('zippy.playbackRate')) || 1);
  const [nextCountdown, setNextCountdown] = useState<number | null>(null);
  const profileId = localStorage.getItem('zippy.profileId') ?? 'profile-farley';
  usePlaybackProgress(info.playableItemId, profileId, video);

  useEffect(() => {
    setQualityOptions(info.qualities.length ? info.qualities : [{ id: 'auto', label: 'Auto' }]);
    setSelectedQualityId('auto');
    setSelectedAudioTrackId(info.audioTracks.find((track) => track.isDefault)?.id ?? info.audioTracks[0]?.id ?? 'audio-default');
    setSelectedSubtitleTrackId(info.subtitleTracks.find((track) => track.isDefault)?.id ?? 'off');
  }, [info.audioTracks, info.playableItemId, info.qualities, info.subtitleTracks]);

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

    const player = new shaka.Player(element) as ManagedShakaPlayer;
    playerRef.current = player;

    const syncQualityTracks = () => {
      const variantTracks = player.getVariantTracks?.() ?? [];
      const byHeight = new Map<number, ShakaVariantTrack>();
      variantTracks.forEach((track) => {
        if (!track.height) return;
        const current = byHeight.get(track.height);
        if (!current || (track.bandwidth ?? 0) > (current.bandwidth ?? 0)) {
          byHeight.set(track.height, track);
        }
      });

      const shakaQualities = Array.from(byHeight.values())
        .sort((a, b) => (a.height ?? 0) - (b.height ?? 0))
        .map((track) => ({
          id: `height-${track.height}`,
          label: `${track.height}p`,
          height: track.height,
          bitrate: track.bandwidth
        }));

      if (shakaQualities.length) {
        setQualityOptions([{ id: 'auto', label: 'Auto' }, ...shakaQualities]);
      }
    };

    element.addEventListener('loadedmetadata', applyInitialPosition);

    player.load(info.hlsUrl).then(() => {
      syncQualityTracks();
      applyInitialPosition();
    }).catch(() => {
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
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        element.currentTime = Math.max(0, element.currentTime - 10);
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        element.currentTime = Math.min(element.duration || Infinity, element.currentTime + 10);
      }
      if (event.code === 'KeyL') {
        event.preventDefault();
        setControlsLocked((locked) => !locked);
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      element.removeEventListener('loadedmetadata', applyInitialPosition);
      playerRef.current = null;
      void player.destroy();
    };
  }, [info.directUrl, info.durationSeconds, info.hlsUrl, info.initialPositionSeconds]);

  useEffect(() => {
    if (video) {
      video.playbackRate = playbackRate;
    }
  }, [playbackRate, video]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const clearNextEpisodeTimer = () => {
    if (nextTimerRef.current) window.clearTimeout(nextTimerRef.current);
    if (nextIntervalRef.current) window.clearInterval(nextIntervalRef.current);
    nextTimerRef.current = null;
    nextIntervalRef.current = null;
    setNextCountdown(null);
  };

  const playNextEpisode = () => {
    if (!info.nextEpisodeId) return;
    clearNextEpisodeTimer();
    navigate(`/watch/${info.nextEpisodeId}`);
  };

  useEffect(() => {
    if (!video || !info.nextEpisodeId) return;

    const handleEnded = () => {
      setControlsVisible(true);
      setNextCountdown(5);
      nextIntervalRef.current = window.setInterval(() => {
        setNextCountdown((countdown) => {
          if (!countdown || countdown <= 1) return countdown;
          return countdown - 1;
        });
      }, 1000);
      nextTimerRef.current = window.setTimeout(playNextEpisode, 5000);
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      clearNextEpisodeTimer();
    };
  }, [info.nextEpisodeId, navigate, video]);

  useEffect(() => {
    if (!controlsLocked) return;
    setControlsVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
  }, [controlsLocked]);

  const showControls = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    if (controlsLocked) return;

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

  const restart = () => {
    const element = videoRef.current;
    if (!element) return;
    element.currentTime = 0;
    void element.play();
  };

  const changePlaybackRate = (rate: number) => {
    localStorage.setItem('zippy.playbackRate', String(rate));
    setPlaybackRate(rate);
  };

  const changeQuality = (qualityId: string) => {
    setSelectedQualityId(qualityId);
    const player = playerRef.current;
    if (!player) return;

    if (qualityId === 'auto') {
      player.configure({ abr: { enabled: true } });
      return;
    }

    const target = qualityOptions.find((quality) => quality.id === qualityId);
    const track = player.getVariantTracks()
      .filter((variant) => variant.height === target?.height)
      .sort((a, b) => (b.bandwidth ?? 0) - (a.bandwidth ?? 0))[0];
    if (track) {
      player.configure({ abr: { enabled: false } });
      player.selectVariantTrack(track, true);
    }
  };

  const changeAudioTrack = (trackId: string) => {
    setSelectedAudioTrackId(trackId);
    const track = info.audioTracks.find((audioTrack) => audioTrack.id === trackId);
    if (!track) return;

    if (track.language && playerRef.current) {
      playerRef.current.selectAudioLanguage(track.language);
      return;
    }

    const audioTracks = (videoRef.current as (HTMLVideoElement & { audioTracks?: { length: number; [index: number]: { enabled: boolean } } }) | null)?.audioTracks;
    if (audioTracks && typeof track.index === 'number') {
      for (let index = 0; index < audioTracks.length; index += 1) {
        audioTracks[index].enabled = index === track.index;
      }
    }
  };

  const changeSubtitleTrack = (trackId: string) => {
    setSelectedSubtitleTrackId(trackId);
    const player = playerRef.current;
    if (trackId === 'off') {
      player?.setTextTrackVisibility(false);
      Array.from(videoRef.current?.textTracks ?? []).forEach((track) => { track.mode = 'disabled'; });
      return;
    }

    const subtitle = info.subtitleTracks.find((track) => track.id === trackId);
    if (subtitle?.language && player) {
      player.selectTextLanguage(subtitle.language);
      player.setTextTrackVisibility(true);
    }
  };

  return (
    <section className={`watch-screen fit-${fitMode} ${controlsLocked ? 'controls-locked' : ''} ${controlsVisible ? 'controls-visible' : 'controls-hidden'}`} onMouseMove={showControls} onClick={showControls}>
      <video ref={videoRef} className="video-player" autoPlay playsInline onPlay={showControls} onPause={() => setControlsVisible(true)} />
      <PlayerControls
        info={info}
        video={video}
        fitMode={fitMode}
        onToggleFitMode={toggleFitMode}
        controlsLocked={controlsLocked}
        onToggleControlsLock={() => setControlsLocked((locked) => !locked)}
        onRestart={restart}
        qualityOptions={qualityOptions}
        selectedQualityId={selectedQualityId}
        onQualityChange={changeQuality}
        selectedAudioTrackId={selectedAudioTrackId}
        onAudioTrackChange={changeAudioTrack}
        selectedSubtitleTrackId={selectedSubtitleTrackId}
        onSubtitleTrackChange={changeSubtitleTrack}
        playbackRate={playbackRate}
        onPlaybackRateChange={changePlaybackRate}
        nextCountdown={nextCountdown}
        onCancelNextEpisode={clearNextEpisodeTimer}
        onPlayNextEpisode={playNextEpisode}
      />
    </section>
  );
}
