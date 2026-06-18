import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileCard } from '../../components/cards/ProfileCard';
import { LoadingScreen } from '../../components/layout/LoadingScreen';
import { api } from '../../services/api';
import type { Profile } from '../../types/user';

export function Profiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[] | null>(null);

  useEffect(() => {
    api.profiles().then(setProfiles);
  }, []);

  if (!profiles) return <LoadingScreen />;

  return (
    <main className="profiles-screen">
      <h1>Quem esta assistindo?</h1>
      <div className="profile-grid">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onSelect={async (selected) => {
              localStorage.setItem('zippy.profileId', selected.id);
              await api.selectProfile(selected.id);
              navigate('/');
            }}
          />
        ))}
      </div>
      <button className="ghost-action" tabIndex={0}>Gerenciar</button>
    </main>
  );
}
