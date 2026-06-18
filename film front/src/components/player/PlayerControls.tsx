import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Captions, FastForward, Maximize, MoreVertical, Pause, Play, Rewind, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PlaybackInfo } from '../../types/playback';
import { AudioMenu } from './AudioMenu';
import { QualityMenu } from './QualityMenu';
import { SubtitleMenu } from './SubtitleMenu';

export function PlayerControls({ info, video }: { info: PlaybackInfo; video: HTMLVideoElement | null }) {
  const navigate = useNavigate();
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(info.durationSeconds || 0);

  useEffect(() => {
    if (!video) return;

    const sync = () => {
      setPaused(video.paused);
      setMuted(video.muted || video.volume === 0);
      setCurrentTime(video.currentTime || 0);
      setDuration(video.duration || info.durationSeconds || 0);
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

  const toggleMute = () => {
    if (!video) return;
    video.muted = !video.muted;
  };

  const toggleFullscreen = () => {
    const target = document.querySelector('.watch-screen') as HTMLElement | null;
    if (!document.fullscreenElement) {
      void target?.requestFullscreen();
      return;
    }
    void document.exitFullscreen();
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

  return (
    <div className="player-controls">
      <div className="player-top-bar">
        <button className="player-icon-button" aria-label="Sair" title="Sair" onClick={() => navigate(-1)} tabIndex={0}>
          <X size={32} />
        </button>
      </div>

      <div className="player-title-block">
        <strong>{info.title}</strong>
        <span>Zippy Player</span>
      </div>

      <div className="player-bottom-panel">
        <div className="player-timeline">
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
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="player-command-row">
          <div className="player-left-actions">
            <button className="player-icon-button" aria-label="Voltar 10 segundos" title="Voltar 10 segundos" onClick={() => seek(-10)} tabIndex={0}>
              <RotateCcw size={32} />
            </button>
            <button className="player-main-button" aria-label={paused ? 'Reproduzir' : 'Pausar'} title={paused ? 'Reproduzir' : 'Pausar'} onClick={toggle} tabIndex={0}>
              {paused ? <Play size={42} fill="currentColor" /> : <Pause size={42} fill="currentColor" />}
            </button>
            <button className="player-icon-button" aria-label="Avancar 10 segundos" title="Avancar 10 segundos" onClick={() => seek(10)} tabIndex={0}>
              <RotateCcw className="mirror-icon" size={32} />
            </button>
            <button className="player-icon-button" aria-label="Retroceder" title="Retroceder" onClick={() => seek(-30)} tabIndex={0}>
              <Rewind size={30} />
            </button>
            <button className="player-icon-button" aria-label="Avancar" title="Avancar" onClick={() => seek(30)} tabIndex={0}>
              <FastForward size={30} />
            </button>
          </div>

          <div className="player-center-meta">
            <span>{info.title}</span>
          </div>

          <div className="player-right-actions">
            <button className="player-icon-button" aria-label="Volume" title="Volume" onClick={toggleMute} tabIndex={0}>
              {muted ? <VolumeX size={30} /> : <Volume2 size={30} />}
            </button>
            <div className="player-select-wrap"><QualityMenu qualities={info.qualities} /></div>
            <div className="player-select-wrap"><AudioMenu tracks={info.audioTracks} /></div>
            <div className="player-select-wrap subtitle-select"><Captions size={24} /><SubtitleMenu tracks={info.subtitleTracks.length ? info.subtitleTracks : ['Desligada']} /></div>
            <button className="player-icon-button" aria-label="Tela cheia" title="Tela cheia" onClick={toggleFullscreen} tabIndex={0}>
              <Maximize size={30} />
            </button>
            <button className="player-icon-button" aria-label="Mais opcoes" title="Mais opcoes" tabIndex={0}>
              <MoreVertical size={30} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
