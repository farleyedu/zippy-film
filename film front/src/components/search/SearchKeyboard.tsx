const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

export function SearchKeyboard({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="search-keyboard">
      {keys.map((key) => <button key={key} onClick={() => onKey(key)} tabIndex={0}>{key}</button>)}
      <button onClick={() => onKey(' ')} tabIndex={0}>Espaco</button>
      <button onClick={() => onKey('BACK')} tabIndex={0}>Apagar</button>
    </div>
  );
}
