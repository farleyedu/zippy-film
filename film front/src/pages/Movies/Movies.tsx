import { useEffect, useState } from 'react';
import { MovieCard } from '../../components/cards/MovieCard';
import { AppShell } from '../../components/layout/AppShell';
import { api } from '../../services/api';
import type { Media } from '../../types/media';

export function Movies() {
  const [items, setItems] = useState<Media[]>([]);
  const [genre, setGenre] = useState('Todos');

  useEffect(() => {
    api.movies().then(setItems);
  }, []);

  const genres = ['Todos', ...Array.from(new Set(items.map((item) => item.genre).filter(Boolean)))];
  const filtered = genre === 'Todos' ? items : items.filter((item) => item.genre === genre);

  return (
    <AppShell>
      <section className="catalog-page">
        <h1>Filmes</h1>
        <div className="filter-row">{genres.map((item) => <button key={item} className={genre === item ? 'active' : ''} onClick={() => setGenre(item)} tabIndex={0}>{item}</button>)}</div>
        <div className="media-grid">{filtered.map((item) => <MovieCard key={item.id} media={item} />)}</div>
      </section>
    </AppShell>
  );
}
