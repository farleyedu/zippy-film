import { useEffect, useState } from 'react';
import { MediaCard } from '../../components/cards/MediaCard';
import { AppShell } from '../../components/layout/AppShell';
import { SearchKeyboard } from '../../components/search/SearchKeyboard';
import { VoiceSearchButton } from '../../components/search/VoiceSearchButton';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Media[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = window.setTimeout(() => api.search(query).then(setResults), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <AppShell>
      <section className="search-page">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar filmes, series e episodios" autoFocus tabIndex={0} />
        <div className="hero-actions">
          <button onClick={() => setQuery('')} tabIndex={0}>Limpar</button>
          <VoiceSearchButton onText={setQuery} />
        </div>
        <SearchKeyboard onKey={(key) => setQuery((value) => key === 'BACK' ? value.slice(0, -1) : value + key)} />
        <div className="media-grid">{results.map((item) => <MediaCard key={item.id} media={item} />)}</div>
      </section>
    </AppShell>
  );
}
