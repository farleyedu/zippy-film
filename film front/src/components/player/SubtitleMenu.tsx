import type { PlaybackTrackOption } from '../../types/playback';

export function SubtitleMenu({
  tracks,
  value,
  onChange
}: {
  tracks: PlaybackTrackOption[];
  value: string;
  onChange: (trackId: string) => void;
}) {
  return (
    <select aria-label="Legenda" value={value} onChange={(event) => onChange(event.target.value)} tabIndex={0}>
      {tracks.map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}
    </select>
  );
}
