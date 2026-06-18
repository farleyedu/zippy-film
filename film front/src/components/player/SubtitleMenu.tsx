export function SubtitleMenu({ tracks }: { tracks: string[] }) {
  return <select aria-label="Legenda" tabIndex={0}>{tracks.map((track) => <option key={track}>{track}</option>)}</select>;
}
