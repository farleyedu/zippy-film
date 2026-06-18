import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useRemoteNavigation } from './hooks/useRemoteNavigation';
import { api } from './services/api';
import { Login } from './pages/Login/Login';
import { Profiles } from './pages/Profiles/Profiles';
import { Home } from './pages/Home/Home';
import { Movies } from './pages/Movies/Movies';
import { Series } from './pages/Series/Series';
import { MovieDetail } from './pages/MovieDetail/MovieDetail';
import { SeriesDetail } from './pages/SeriesDetail/SeriesDetail';
import { Watch } from './pages/Watch/Watch';
import { Search } from './pages/Search/Search';
import { MyList } from './pages/MyList/MyList';
import { ContinueWatching } from './pages/ContinueWatching/ContinueWatching';
import { History } from './pages/History/History';
import { Settings } from './pages/Settings/Settings';
import { ErrorPage } from './pages/Error/ErrorPage';

export function App() {
  useRemoteNavigation();
  const location = useLocation();
  const hasSession = api.session().hasToken;

  if (!hasSession && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/profiles" element={<Profiles />} />
      <Route path="/" element={<Home />} />
      <Route path="/movies" element={<Movies />} />
      <Route path="/series" element={<Series />} />
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/series/:id" element={<SeriesDetail />} />
      <Route path="/series/:id/season/:seasonNumber" element={<SeriesDetail />} />
      <Route path="/watch/:playableItemId" element={<Watch />} />
      <Route path="/search" element={<Search />} />
      <Route path="/my-list" element={<MyList />} />
      <Route path="/continue" element={<ContinueWatching />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
