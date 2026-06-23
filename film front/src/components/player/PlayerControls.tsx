import { useEffect, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import { Cast, ChevronLeft, ListVideo, Lock, Maximize, MessageSquareText, Pause, Play, RotateCcw, SkipForward, Unlock, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PlaybackInfo, PlaybackQualityOption } from '../../types/playback';
import { AudioMenu } from './AudioMenu';
import { SubtitleMenu } from './SubtitleMenu';

type PlayerFitMode = 'contain' | 'cover';

export function PlayerControls({
  info,
  video,
  fitMode,
  onToggleFitMode,
  controlsLocked,
  onToggleControlsLock,
  onRestart,
  qualityOptions,
  selectedQualityId,
  onQualityChange,
  selectedAudioTrackId,
  onAudioTrackChange,
  selectedSubtitleTrackId,
  onSubtitleTrackChange,
  playbackRate,
  onPlaybackRateChange,
  nextCountdown,
  onCancelNextEpisode,
  onPlayNextEpisode
}: {
  info: PlaybackInfo;
  video: HTMLVideoElement | null;
  fitMode: PlayerFitMode;
  onToggleFitMode: () => void;
  controlsLocked: boolean;
  onToggleControlsLock: () => void;
  onRestart: () => void;
  qualityOptions: PlaybackQualityOption[];
  selectedQualityId: string;
  onQualityChange: (qualityId: string) => void;
  selectedAudioTrackId: string;
  onAudioTrackChange: (trackId: string) => void;
  selectedSubtitleTrackId: string;
  onSubtitleTrackChange: (trackId: string) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  nextCountdown: number | null;
  onCancelNextEpisode: () => void;
  onPlayNextEpisode: () => void;
}) {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(info.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [episodePanelOpen, setEpisodePanelOpen] = useState(false);
  const [audioPanelOpen, setAudioPanelOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [volumeDragging, setVolumeDragging] = useState(false);
  const [timelinePreview, setTimelinePreview] = useState<{ x: number; time: number } | null>(null);

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

  const updateVolumeFromPointer = (clientY: number, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const next = 1 - ((clientY - rect.top) / rect.height);
    setVideoVolume(next);
  };

  const handleVolumePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setVolumeDragging(true);
    setVolumeOpen(true);
    updateVolumeFromPointer(event.clientY, event.currentTarget);
  };

  const handleVolumePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!volumeDragging) return;
    updateVolumeFromPointer(event.clientY, event.currentTarget);
  };

  const handleVolumePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    setVolumeDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
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
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const updateTimelinePreview = (event: PointerEvent<HTMLInputElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    setTimelinePreview({
      x: ratio * rect.width,
      time: ratio * duration
    });
  };

  return (
    <div className="player-controls player-compact">
      <div className="player-mobile-top">
        <button className="player-plain-button" aria-label="Voltar" title="Voltar" onClick={() => navigate(-1)} tabIndex={0}>
          <ChevronLeft size={42} />
        </button>
        <div className="player-title-stack">
          {info.seriesTitle && <em>{info.seriesTitle}</em>}
          <strong>{info.displayTitle ?? info.title}</strong>
        </div>
        <button
          className={`player-plain-button fit-toggle-button ${fitMode === 'cover' ? 'active' : ''}`}
          aria-label={fitMode === 'cover' ? 'Mostrar video inteiro' : 'Preencher tela'}
          title={fitMode === 'cover' ? 'Mostrar video inteiro' : 'Preencher tela'}
          onClick={onToggleFitMode}
          tabIndex={0}
        >
          <Maximize size={34} />
        </button>
        <button
          className={`player-plain-button lock-toggle-button ${controlsLocked ? 'active' : ''}`}
          aria-label={controlsLocked ? 'Destravar controles' : 'Travar controles'}
          title={controlsLocked ? 'Destravar controles' : 'Travar controles'}
          onClick={onToggleControlsLock}
          tabIndex={0}
        >
          {controlsLocked ? <Lock size={32} /> : <Unlock size={32} />}
        </button>
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
        <div className={`vertical-volume-slider ${volumeOpen ? 'open' : ''}`} style={volumeStyle}>
          <div
            className="vertical-volume-track"
            role="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round((muted ? 0 : volume) * 100)}
            tabIndex={volumeOpen ? 0 : -1}
            onPointerDown={handleVolumePointerDown}
            onPointerMove={handleVolumePointerMove}
            onPointerUp={handleVolumePointerUp}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') setVideoVolume(volume + 0.05);
              if (event.key === 'ArrowDown') setVideoVolume(volume - 0.05);
            }}
          >
            <span />
          </div>
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
          {timelinePreview && <b className="timeline-preview" style={{ left: `${timelinePreview.x}px` }}>{formatTime(timelinePreview.time)}</b>}
          <input
            aria-label="Progresso"
            type="range"
            min="0"
            max={Math.max(1, duration)}
            value={Math.min(currentTime, Math.max(1, duration))}
            style={progressStyle}
            onChange={(event) => setProgress(event.target.value)}
            onPointerMove={updateTimelinePreview}
            onPointerLeave={() => setTimelinePreview(null)}
            tabIndex={0}
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="mobile-action-row">
          <button onClick={onRestart} tabIndex={0}>
            <RotateCcw size={32} />
            <span>Recomecar</span>
          </button>
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
          <label>
            Qualidade
            <select aria-label="Qualidade" value={selectedQualityId} onChange={(event) => onQualityChange(event.target.value)} tabIndex={0}>
              {qualityOptions.map((quality) => <option key={quality.id} value={quality.id}>{quality.label}</option>)}
            </select>
          </label>
          <label>
            Velocidade
            <select aria-label="Velocidade" value={playbackRate} onChange={(event) => onPlaybackRateChange(Number(event.target.value))} tabIndex={0}>
              {speedOptions.map((speed) => <option key={speed} value={speed}>{speed === 1 ? 'Normal' : `${speed}x`}</option>)}
            </select>
          </label>
          <label>Audio<AudioMenu tracks={info.audioTracks} value={selectedAudioTrackId} onChange={onAudioTrackChange} /></label>
          <label>Legenda<SubtitleMenu tracks={info.subtitleTracks} value={selectedSubtitleTrackId} onChange={onSubtitleTrackChange} /></label>
        </div>
      )}

      {nextCountdown !== null && (
        <div className="next-episode-overlay">
          <strong>Proximo episodio em {nextCountdown}</strong>
          <div>
            <button onClick={onPlayNextEpisode} tabIndex={0}>Assistir agora</button>
            <button className="secondary" onClick={onCancelNextEpisode} tabIndex={0}>Cancelar</button>
          </div>
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
                <small>{episode.durationMinutes ? `${episode.durationMinutes} min` : ''}{episode.isPlayed ? ' / assistido' : ''}</small>
                {typeof episode.progress === 'number' && <i style={{ width: `${episode.progress}%` }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
