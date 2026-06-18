export function AudioMenu({ tracks }: { tracks: string[] }) {
  return <select aria-label="Audio" tabIndex={0}>{tracks.map((track) => <option key={track}>{track}</option>)}</select>;
}
