import type { Profile } from '../types/user';
import type { HomeResponse, Media } from '../types/media';
import type { PlaybackInfo } from '../types/playback';
import { mockHome, mockMedia, mockPlayback, mockProfiles } from '../mocks/data';
import { jellyfinApi } from './jellyfinApi';
import { getStoredPlaybackProgress, listStoredPlaybackProgress } from './playbackProgressStore';

function useMocks() {
  return !jellyfinApi.isConfigured();
}

function mediaPlaybackKey(media: Media) {
  return media.playableItemId ?? media.id;
}

function progressPercent(positionSeconds: number, durationSeconds: number) {
  if (durationSeconds <= 0) return undefined;
  return Math.max(1, Math.min(99, Math.round((positionSeconds / durationSeconds) * 100)));
}

function mergeContinueItems(serverItems: Media[], localItems: Media[]) {
  const seen = new Set<string>();
  return [...localItems, ...serverItems].filter((item) => {
    const key = mediaPlaybackKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function localContinueItems() {
  const stored = listStoredPlaybackProgress();
  if (!stored.length) return [];

  const byId = new Map(stored.map((entry) => [entry.itemId, entry]));
  const media = useMocks()
    ? mockMedia.filter((item) => byId.has(mediaPlaybackKey(item)))
    : await jellyfinApi.itemsByIds(stored.map((entry) => entry.itemId)).catch(() => []);

  return media
    .map((item) => {
      const entry = byId.get(mediaPlaybackKey(item)) ?? byId.get(item.id);
      if (!entry) return item;

      return {
        ...item,
        playableItemId: item.playableItemId ?? item.id,
        progress: progressPercent(entry.positionSeconds, entry.durationSeconds) ?? item.progress
      };
    })
    .sort((a, b) => {
      const first = byId.get(mediaPlaybackKey(a))?.updatedAt ?? 0;
      const second = byId.get(mediaPlaybackKey(b))?.updatedAt ?? 0;
      return second - first;
    });
}

export const api = {
  login: (serverUrl: string, username: string, password: string) => jellyfinApi.login(serverUrl, username, password),

  logout() {
    jellyfinApi.logout();
  },

  session: () => jellyfinApi.getSession(),
  testConnection: () => jellyfinApi.testConnection(),

  profiles: async (): Promise<Profile[]> => {
    if (useMocks()) return mockProfiles;
    return jellyfinApi.profiles();
  },

  selectProfile: async (profileId: string) => {
    localStorage.setItem('zippy.profileId', profileId);
    return { profileId };
  },

  home: async (): Promise<HomeResponse> => {
    if (useMocks()) return mockHome;
    const home = await jellyfinApi.home();
    const localResume = await localContinueItems();
    if (!localResume.length) return home;

    const rows = home.rows.filter((row) => row.title !== 'Continuar assistindo');
    const serverResume = home.rows.find((row) => row.title === 'Continuar assistindo')?.items ?? [];
    const resume = mergeContinueItems(serverResume, localResume);

    return {
      ...home,
      hero: home.hero ?? resume[0] ?? null,
      rows: resume.length ? [{ title: 'Continuar assistindo', items: resume }, ...rows] : rows
    };
  },

  movies: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.filter((item) => item.type === 'MOVIE');
    return jellyfinApi.movies();
  },

  series: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.filter((item) => item.type === 'SERIES');
    return jellyfinApi.series();
  },

  media: async (id: string): Promise<Media> => {
    if (useMocks()) return mockMedia.find((item) => item.id === id) ?? mockMedia[0];
    return jellyfinApi.item(id);
  },

  seriesDetail: async (id: string): Promise<Media> => {
    if (useMocks()) return mockMedia.find((item) => item.id === id) ?? mockMedia[0];
    return jellyfinApi.seriesDetail(id);
  },

  search: async (q: string): Promise<Media[]> => {
    if (useMocks()) return mockMedia.filter((item) => item.title.toLowerCase().includes(q.toLowerCase()));
    return jellyfinApi.search(q);
  },

  playback: async (playableItemId: string): Promise<PlaybackInfo> => {
    const info = useMocks() ? mockPlayback(playableItemId) : await jellyfinApi.playback(playableItemId);
    const stored = getStoredPlaybackProgress(playableItemId);
    if (!stored) return info;

    const serverPosition = info.initialPositionSeconds ?? 0;
    const duration = info.durationSeconds || stored.durationSeconds;
    const canResumeStoredPosition = !duration || stored.positionSeconds < duration - 20;
    if (canResumeStoredPosition && stored.positionSeconds > serverPosition) {
      return { ...info, initialPositionSeconds: stored.positionSeconds };
    }

    return info;
  },

  reportStart: (playableItemId: string, currentTimeSeconds = 0) =>
    useMocks() ? Promise.resolve() : jellyfinApi.reportStart(playableItemId, currentTimeSeconds),

  saveProgress: (playableItemId: string, _profileId: string, currentTimeSeconds: number, _durationSeconds?: number, isPaused = false) =>
    useMocks() ? Promise.resolve() : jellyfinApi.saveProgress(playableItemId, currentTimeSeconds, isPaused),

  reportStopped: (playableItemId: string, currentTimeSeconds: number) =>
    useMocks() ? Promise.resolve() : jellyfinApi.reportStopped(playableItemId, currentTimeSeconds),

  lists: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.slice(1, 4);
    return jellyfinApi.favorites();
  },

  favorites: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.slice(1, 4);
    return jellyfinApi.favorites();
  },

  continueWatching: async (): Promise<Media[]> => {
    const serverItems = useMocks()
      ? mockMedia.filter((item) => item.progress)
      : await jellyfinApi.continueWatching().catch(() => []);
    const localItems = await localContinueItems();
    return mergeContinueItems(serverItems, localItems);
  },

  history: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.filter((item) => item.progress);
    return jellyfinApi.watched();
  },

  addList: (profileId: string, mediaId: string, listType: string) => {
    void profileId;
    return jellyfinApi.setFavorite(mediaId, listType !== 'DISLIKED');
  },

  setFavorite: (mediaId: string, favorite: boolean) =>
    useMocks() ? Promise.resolve() : jellyfinApi.setFavorite(mediaId, favorite),

  settings: async () => jellyfinApi.getSession(),

  saveSettings: async () => undefined
};
