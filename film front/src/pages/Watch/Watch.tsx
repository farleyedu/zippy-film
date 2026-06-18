import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Player } from '../../components/player/Player';
import { api } from '../../services/api';
import type { PlaybackInfo } from '../../types/playback';

export function Watch() {
  const { playableItemId = '' } = useParams();
  const [info, setInfo] = useState<PlaybackInfo | null>(null);

  useEffect(() => {
    api.playback(playableItemId).then(setInfo);
  }, [playableItemId]);

  return info ? <Player info={info} /> : null;
}
