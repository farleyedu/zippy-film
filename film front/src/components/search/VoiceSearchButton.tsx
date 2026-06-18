import { Mic } from 'lucide-react';
import { useVoiceSearch } from '../../hooks/useVoiceSearch';

export function VoiceSearchButton({ onText }: { onText: (value: string) => void }) {
  const voice = useVoiceSearch(onText);

  return (
    <button disabled={!voice.supported} onClick={voice.start} tabIndex={0}>
      <Mic size={24} />
      {voice.supported ? (voice.listening ? 'Ouvindo' : 'Falar') : 'Digitar'}
    </button>
  );
}
