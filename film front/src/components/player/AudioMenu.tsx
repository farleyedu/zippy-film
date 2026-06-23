import type { PlaybackTrackOption } from '../../types/playback';

export function AudioMenu({
  tracks,
  value,
  onChange
}: {
  tracks: PlaybackTrackOption[];
  value: string;
  onChange: (trackId: string) => void;
}) {
  return (
    <select aria-label="Audio" value={value} onChange={(event) => onChange(event.target.value)} tabIndex={0}>
      {tracks.map((track) => <option key={track.id} value={track.id}>{track.label}</option>)}
    </select>
  );
}
