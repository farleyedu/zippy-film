import { Pause, Play, RotateCcw, RotateCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PlaybackInfo } from '../../types/playback';
import { AudioMenu } from './AudioMenu';
import { QualityMenu } from './QualityMenu';
import { SubtitleMenu } from './SubtitleMenu';

export function PlayerControls({ info, video }: { info: PlaybackInfo; video: HTMLVideoElement | null }) {
  const navigate = useNavigate();
  const toggle = () => {
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  return (
    <div className="player-controls">
      <strong>{info.title}</strong>
      <div className="player-buttons">
        <button onClick={() => video && (video.currentTime = Math.max(0, video.currentTime - 10))} tabIndex={0}><RotateCcw size={30} /></button>
        <button onClick={toggle} tabIndex={0}><Play size={34} /><Pause size={34} /></button>
        <button onClick={() => video && (video.currentTime += 10)} tabIndex={0}><RotateCw size={30} /></button>
        <QualityMenu qualities={info.qualities} />
        <AudioMenu tracks={info.audioTracks} />
        <SubtitleMenu tracks={info.subtitleTracks.length ? info.subtitleTracks : ['Desligada']} />
        <button onClick={() => navigate(-1)} tabIndex={0}><X size={30} /></button>
      </div>
    </div>
  );
}
