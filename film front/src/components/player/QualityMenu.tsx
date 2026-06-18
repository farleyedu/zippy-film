export function QualityMenu({ qualities }: { qualities: string[] }) {
  return <select aria-label="Qualidade" tabIndex={0}>{qualities.map((quality) => <option key={quality}>{quality}</option>)}</select>;
}
