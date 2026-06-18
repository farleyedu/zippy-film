import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Cast, ChevronLeft, ListVideo, MessageSquareText, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PlaybackInfo } from '../../types/playback';
import { AudioMenu } from './AudioMenu';
import { SubtitleMenu } from './SubtitleMenu';

export function PlayerControls({ info, video }: { info: PlaybackInfo; video: HTMLVideoElement | null }) {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(info.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [episodePanelOpen, setEpisodePanelOpen] = useState(false);
  const [audioPanelOpen, setAudioPanelOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);

  useEffect(() => {
    if (!video) return;

    const sync = () => {
      setPaused(video.paused);
      setCurrentTime(video.currentTime || 0);
      setDuration(video.duration || info.durationSeconds || 0);
      setVolume(video.muted ? 0 : video.volume);
      setMuted(video.muted || video.volume === 0);
    };

    sync();
    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    video.addEventListener('timeupdate', sync);
    video.addEventListener('durationchange', sync);
    video.addEventListener('volumechange', sync);

    return () => {
      video.removeEventListener('play', sync);
      video.removeEventListener('pause', sync);
      video.removeEventListener('timeupdate', sync);
      video.removeEventListener('durationchange', sync);
      video.removeEventListener('volumechange', sync);
    };
  }, [info.durationSeconds, video]);

  const toggle = () => {
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const seek = (seconds: number) => {
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || duration || 0, video.currentTime + seconds));
  };

  const setProgress = (value: string) => {
    if (!video) return;
    video.currentTime = Number(value);
    setCurrentTime(Number(value));
  };

  const setVideoVolume = (value: number) => {
    if (!video) return;
    const nextVolume = Math.max(0, Math.min(1, value));
    video.volume = nextVolume;
    video.muted = nextVolume === 0;
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  };

  const formatTime = (value: number) => {
    const total = Math.max(0, Math.floor(value || 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const progressStyle = {
    '--progress': `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`
  } as CSSProperties;

  const volumeStyle = {
    '--volume': `${Math.round((muted ? 0 : volume) * 100)}%`
  } as CSSProperties;

  const episodes = info.episodes ?? [];
  const isSeries = episodes.length > 0;

  return (
    <div className="player-controls player-compact">
      <div className="player-mobile-top">
        <button className="player-plain-button" aria-label="Voltar" title="Voltar" onClick={() => navigate(-1)} tabIndex={0}>
          <ChevronLeft size={42} />
        </button>
        <strong>{info.displayTitle ?? info.title}</strong>
        <button className="player-plain-button" aria-label="Transmitir" title="Transmitir" tabIndex={0}>
          <Cast size={36} />
        </button>
      </div>

      <div className="mobile-volume-control">
        <button
          className="player-plain-button"
          aria-label="Volume"
          title="Volume"
          onClick={() => setVolumeOpen((open) => !open)}
          tabIndex={0}
        >
          {muted ? <VolumeX size={34} /> : <Volume2 size={34} />}
        </button>
        <div className={`vertical-volume-slider ${volumeOpen ? 'open' : ''}`}>
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="100"
            value={Math.round((muted ? 0 : volume) * 100)}
            style={volumeStyle}
            onChange={(event) => setVideoVolume(Number(event.target.value) / 100)}
            onPointerDown={() => setVolumeOpen(true)}
            tabIndex={volumeOpen ? 0 : -1}
          />
        </div>
      </div>

      <div className="player-center-controls">
        <button className="skip-ten-button" aria-label="Voltar 10 segundos" title="Voltar 10 segundos" onClick={() => seek(-10)} tabIndex={0}>
          <RotateCcw size={42} />
          <span>10</span>
        </button>
        <button className="giant-play-button" aria-label={paused ? 'Reproduzir' : 'Pausar'} title={paused ? 'Reproduzir' : 'Pausar'} onClick={toggle} tabIndex={0}>
          {paused ? <Play size={84} fill="currentColor" /> : <Pause size={84} fill="currentColor" />}
        </button>
        <button className="skip-ten-button forward" aria-label="Avancar 10 segundos" title="Avancar 10 segundos" onClick={() => seek(10)} tabIndex={0}>
          <RotateCcw size={42} />
          <span>10</span>
        </button>
      </div>

      <div className="player-mobile-bottom">
        <div className="mobile-progress-row">
          <input
            aria-label="Progresso"
            type="range"
            min="0"
            max={Math.max(1, duration)}
            value={Math.min(currentTime, Math.max(1, duration))}
            style={progressStyle}
            onChange={(event) => setProgress(event.target.value)}
            tabIndex={0}
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="mobile-action-row">
          <button disabled={!isSeries} onClick={() => setEpisodePanelOpen(true)} tabIndex={0}>
            <ListVideo size={34} />
            <span>Episodes</span>
          </button>
          <button onClick={() => setAudioPanelOpen((open) => !open)} tabIndex={0}>
            <MessageSquareText size={34} />
            <span>Audio & Subtitles</span>
          </button>
          <button disabled={!info.nextEpisodeId} onClick={() => info.nextEpisodeId && navigate(`/watch/${info.nextEpisodeId}`)} tabIndex={0}>
            <SkipForward size={34} fill="currentColor" />
            <span>Next episode</span>
          </button>
        </div>
      </div>

      {audioPanelOpen && (
        <div className="audio-subtitle-popover">
          <label>Audio<AudioMenu tracks={info.audioTracks} /></label>
          <label>Legenda<SubtitleMenu tracks={info.subtitleTracks.length ? info.subtitleTracks : ['Desligada']} /></label>
        </div>
      )}

      {episodePanelOpen && (
        <div className="episode-drawer">
          <div className="episode-drawer-header">
            <strong>{info.seriesTitle ?? 'Episodes'}</strong>
            <button className="player-plain-button" onClick={() => setEpisodePanelOpen(false)} tabIndex={0}>Fechar</button>
          </div>
          <div className="episode-drawer-list">
            {episodes.map((episode) => (
              <button
                key={episode.id}
                className={episode.id === info.playableItemId ? 'active' : ''}
                onClick={() => navigate(`/watch/${episode.id}`)}
                tabIndex={0}
              >
                <span>S{episode.seasonNumber ?? 1}:E{episode.episodeNumber ?? 1}</span>
                <strong>{episode.title}</strong>
                <small>{episode.durationMinutes ? `${episode.durationMinutes} min` : ''}{episode.isPlayed ? ' • assistido' : ''}</small>
                {typeof episode.progress === 'number' && <i style={{ width: `${episode.progress}%` }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
