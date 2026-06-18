import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { SettingsPanel } from '../../components/settings/SettingsPanel';
import { api } from '../../services/api';

export function Settings() {
  const navigate = useNavigate();
  const session = api.session();
  const [status, setStatus] = useState('Aguardando teste');

  return (
    <AppShell>
      <section className="settings-page">
        <h1>Configuracoes</h1>
        <div className="settings-grid">
          <SettingsPanel title="Jellyfin">
            <p>Servidor: {session.serverUrl || 'Nao configurado'}</p>
            <p>Usuario: {session.user?.name ?? 'Nao conectado'}</p>
            <p>Status: {status}</p>
            <button
              onClick={async () => {
                setStatus('Testando...');
                try {
                  await api.testConnection();
                  setStatus('Conectado');
                } catch {
                  setStatus('Falha na conexao');
                }
              }}
              tabIndex={0}
            >
              Testar conexao
            </button>
          </SettingsPanel>
          <SettingsPanel title="Sessao">
            <button
              onClick={() => {
                api.logout();
                navigate('/login');
              }}
              tabIndex={0}
            >
              Desconectar
            </button>
          </SettingsPanel>
          <SettingsPanel title="Player"><button tabIndex={0}>Preferencias locais</button></SettingsPanel>
          <SettingsPanel title="Legendas"><button tabIndex={0}>Ajustar visual</button></SettingsPanel>
          <SettingsPanel title="Qualidade"><button tabIndex={0}>Auto</button></SettingsPanel>
          <SettingsPanel title="Aparencia"><button tabIndex={0}>Zippy escuro</button></SettingsPanel>
        </div>
      </section>
    </AppShell>
  );
}
