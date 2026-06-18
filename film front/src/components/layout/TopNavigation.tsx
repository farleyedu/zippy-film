import { Search, Settings } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const links = [
  ['/', 'Inicio'],
  ['/movies', 'Filmes'],
  ['/series', 'Series'],
  ['/continue', 'Continuar'],
  ['/my-list', 'Minha Lista'],
  ['/history', 'Historico']
];

export function TopNavigation() {
  const navigate = useNavigate();

  return (
    <header className="top-nav">
      <button className="logo-button" onClick={() => navigate('/')} tabIndex={0}>Zippy</button>
      <nav>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} tabIndex={0}>{label}</NavLink>
        ))}
      </nav>
      <div className="nav-actions">
        <button aria-label="Buscar" title="Buscar" onClick={() => navigate('/search')} tabIndex={0}><Search size={24} /></button>
        <button aria-label="Configuracoes" title="Configuracoes" onClick={() => navigate('/settings')} tabIndex={0}><Settings size={24} /></button>
        <button className="avatar-mini" onClick={() => navigate('/profiles')} tabIndex={0}>F</button>
      </div>
    </header>
  );
}
