import { Check, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';

type FavoriteButtonVariant = 'pill' | 'icon' | 'card';

export function FavoriteButton({
  mediaId,
  isFavorite,
  variant = 'pill',
  onChanged
}: {
  mediaId: string;
  isFavorite?: boolean;
  variant?: FavoriteButtonVariant;
  onChanged?: (favorite: boolean) => void;
}) {
  const [favorite, setFavorite] = useState(Boolean(isFavorite));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFavorite(Boolean(isFavorite));
  }, [isFavorite, mediaId]);

  const toggle = async () => {
    if (saving) return;
    const next = !favorite;
    setFavorite(next);
    setSaving(true);
    onChanged?.(next);

    try {
      await api.setFavorite(mediaId, next);
    } catch {
      setFavorite(!next);
      onChanged?.(!next);
    } finally {
      setSaving(false);
    }
  };

  const Icon = favorite ? Check : Plus;
  const label = favorite ? 'Na minha lista' : 'Minha lista';
  const actionLabel = favorite ? 'Remover da minha lista' : 'Adicionar a minha lista';

  return (
    <button
      className={`favorite-toggle favorite-toggle-${variant} ${favorite ? 'active' : ''}`}
      aria-pressed={favorite}
      aria-label={actionLabel}
      title={actionLabel}
      disabled={saving}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggle();
      }}
      tabIndex={0}
    >
      <Icon size={variant === 'card' ? 22 : 24} />
      {variant !== 'icon' && <span>{label}</span>}
    </button>
  );
}
