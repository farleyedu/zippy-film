import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

export function Login() {
  const navigate = useNavigate();
  const currentSession = api.session();
  const [serverUrl, setServerUrl] = useState(currentSession.serverUrl || 'http://localhost:8096');
  const [username, setUsername] = useState(currentSession.user?.name ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentSession.hasToken) {
      navigate('/');
    }
  }, [currentSession.hasToken, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await api.login(serverUrl, username, password);
      navigate('/');
    } catch {
      setError('Nao foi possivel autenticar no Jellyfin. Confira URL, usuario e senha.');
    }
  };

  return (
    <main className="auth-screen">
      <form className="auth-panel" onSubmit={submit}>
        <h1>Zippy</h1>
        <input value={serverUrl} onChange={(event) => setServerUrl(event.target.value)} placeholder="URL do Jellyfin Server" tabIndex={0} />
        <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Usuario Jellyfin" tabIndex={0} />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Senha" type="password" tabIndex={0} />
        {error && <p className="form-error">{error}</p>}
        <button type="submit" tabIndex={0}>Entrar</button>
      </form>
    </main>
  );
}
