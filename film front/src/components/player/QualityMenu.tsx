import type { PlaybackQualityOption } from '../../types/playback';

export function QualityMenu({
  qualities,
  value,
  onChange
}: {
  qualities: PlaybackQualityOption[];
  value: string;
  onChange: (qualityId: string) => void;
}) {
  return (
    <select aria-label="Qualidade" value={value} onChange={(event) => onChange(event.target.value)} tabIndex={0}>
      {qualities.map((quality) => <option key={quality.id} value={quality.id}>{quality.label}</option>)}
    </select>
  );
}
