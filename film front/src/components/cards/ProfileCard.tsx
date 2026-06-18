import type { Profile } from '../../types/user';

export function ProfileCard({ profile, onSelect }: { profile: Profile; onSelect: (profile: Profile) => void }) {
  return (
    <button className="profile-card" onClick={() => onSelect(profile)} tabIndex={0}>
      <div>{profile.avatar}</div>
      <span>{profile.name}</span>
    </button>
  );
}
