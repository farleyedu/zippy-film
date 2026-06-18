import { useMemo, useState } from 'react';

type SpeechRecognitionConstructor = new () => SpeechRecognition;

type SpeechRecognition = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: { results: { 0: { transcript: string } }[] }) => void) | null;
  onend: (() => void) | null;
};

export function useVoiceSearch(onText: (value: string) => void) {
  const [listening, setListening] = useState(false);
  const Recognition = useMemo(() => {
    const win = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    return win.SpeechRecognition ?? win.webkitSpeechRecognition;
  }, []);

  const supported = Boolean(Recognition);

  const start = () => {
    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.onresult = (event) => onText(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };

  return { supported, listening, start };
}
