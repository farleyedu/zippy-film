import type { HomeResponse, Media } from '../types/media';
import type { PlaybackInfo } from '../types/playback';
import type { Profile } from '../types/user';

const img = (seed: string, w = 900, h = 1350) => `https://picsum.photos/seed/zippy-${seed}/${w}/${h}`;

export const mockProfiles: Profile[] = [
  { id: 'profile-farley', name: 'Farley', avatar: 'F', isKids: false, language: 'pt-BR', maturityLevel: 'ALL' },
  { id: 'profile-cinema', name: 'Cinema', avatar: 'C', isKids: false, language: 'pt-BR', maturityLevel: 'ALL' }
];

export const mockMedia: Media[] = [
  {
    id: 'm1',
    type: 'MOVIE',
    title: 'Noite Vermelha',
    year: 2026,
    genre: 'Acao',
    overview: 'Uma missao urbana atravessa a madrugada enquanto a cidade fica sem energia.',
    posterUrl: img('night-red'),
    backdropUrl: img('night-red-backdrop', 1600, 900),
    voteAverage: 8.1,
    progress: 46,
    playableItemId: 'p1'
  },
  {
    id: 'm2',
    type: 'MOVIE',
    title: 'Orbita Final',
    year: 2025,
    genre: 'Ficcao',
    overview: 'Uma tripulacao tenta voltar para casa depois de encontrar um sinal impossivel.',
    posterUrl: img('orbit'),
    backdropUrl: img('orbit-backdrop', 1600, 900),
    voteAverage: 7.8,
    playableItemId: 'p2'
  },
  {
    id: 'm3',
    type: 'MOVIE',
    title: 'Rua do Silencio',
    year: 2024,
    genre: 'Suspense',
    overview: 'Um bairro tranquilo revela camadas de segredos quando uma camera antiga reaparece.',
    posterUrl: img('silent-street'),
    backdropUrl: img('silent-street-backdrop', 1600, 900),
    voteAverage: 7.4,
    progress: 18,
    playableItemId: 'p3'
  },
  {
    id: 's1',
    type: 'SERIES',
    title: 'Horizonte 12',
    year: 2026,
    genre: 'Drama',
    overview: 'Quatro familias vivem em uma cidade costeira onde cada decisao ecoa por decadas.',
    posterUrl: img('horizon'),
    backdropUrl: img('horizon-backdrop', 1600, 900),
    voteAverage: 8.7,
    progress: 64,
    playableItemId: 'ep1',
    seasons: [
      {
        seasonNumber: 1,
        title: 'Temporada 1',
        episodes: [
          { id: 'e1', playableItemId: 'ep1', episodeNumber: 1, title: 'Mar Aberto', overview: 'A cidade acorda com um misterio no cais.', durationMinutes: 52, stillUrl: img('ep1', 640, 360), progress: 100 },
          { id: 'e2', playableItemId: 'ep2', episodeNumber: 2, title: 'Linha de Fogo', overview: 'Um pacto antigo volta a assombrar os moradores.', durationMinutes: 48, stillUrl: img('ep2', 640, 360), progress: 36 },
          { id: 'e3', playableItemId: 'ep3', episodeNumber: 3, title: 'Vento Sul', overview: 'As pistas apontam para alguem muito proximo.', durationMinutes: 51, stillUrl: img('ep3', 640, 360) }
        ]
      }
    ]
  },
  {
    id: 's2',
    type: 'SERIES',
    title: 'Codigo Aurora',
    year: 2025,
    genre: 'Tecnologia',
    overview: 'Uma engenheira descobre que seu sistema preve eventos antes de acontecerem.',
    posterUrl: img('aurora'),
    backdropUrl: img('aurora-backdrop', 1600, 900),
    voteAverage: 8.3,
    playableItemId: 'ep4'
  }
];

export const mockHome: HomeResponse = {
  hero: mockMedia[0],
  rows: [
    { title: 'Continuar assistindo', items: mockMedia.filter((item) => item.progress) },
    { title: 'Filmes adicionados recentemente', items: mockMedia.filter((item) => item.type === 'MOVIE') },
    { title: 'Series para maratonar', items: mockMedia.filter((item) => item.type === 'SERIES') },
    { title: 'Acao e aventura', items: mockMedia },
    { title: 'Minha lista', items: mockMedia.slice(1, 4) }
  ]
};

export const mockPlayback = (playableItemId: string): PlaybackInfo => ({
  playableItemId,
  title: mockMedia.find((item) => item.playableItemId === playableItemId)?.title ?? 'Zippy Player',
  displayTitle: playableItemId.startsWith('ep') ? 'S1:E2 "Linha de Fogo"' : undefined,
  seriesTitle: playableItemId.startsWith('ep') ? 'Horizonte 12' : undefined,
  hlsUrl: '/media-stream/' + playableItemId + '/master.m3u8',
  durationSeconds: 7200,
  qualities: [
    { id: 'auto', label: 'Auto' },
    { id: 'height-480', label: '480p', height: 480 },
    { id: 'height-720', label: '720p', height: 720 },
    { id: 'height-1080', label: '1080p', height: 1080 }
  ],
  audioTracks: [
    { id: 'audio-pt-br', label: 'Portugues', language: 'pt-BR', isDefault: true },
    { id: 'audio-en-us', label: 'Ingles', language: 'en-US' }
  ],
  subtitleTracks: [
    { id: 'off', label: 'Desligada' },
    { id: 'sub-pt-br', label: 'Portugues', language: 'pt-BR' }
  ],
  episodes: mockMedia.find((item) => item.id === 's1')?.seasons?.[0].episodes.map((episode) => ({
    id: episode.playableItemId,
    title: episode.title,
    seasonNumber: 1,
    episodeNumber: episode.episodeNumber,
    durationMinutes: episode.durationMinutes,
    progress: episode.progress,
    isPlayed: episode.isPlayed
  })),
  nextEpisodeId: 'ep3'
});
