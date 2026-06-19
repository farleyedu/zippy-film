import type { Profile } from '../types/user';
import type { HomeResponse, Media } from '../types/media';
import type { PlaybackInfo } from '../types/playback';
import { mockHome, mockMedia, mockPlayback, mockProfiles } from '../mocks/data';
import { jellyfinApi } from './jellyfinApi';

function useMocks() {
  return !jellyfinApi.isConfigured();
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
    return jellyfinApi.home();
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
    if (useMocks()) return mockPlayback(playableItemId);
    return jellyfinApi.playback(playableItemId);
  },

  reportStart: (playableItemId: string, currentTimeSeconds = 0) => jellyfinApi.reportStart(playableItemId, currentTimeSeconds),

  saveProgress: (playableItemId: string, _profileId: string, currentTimeSeconds: number, _durationSeconds?: number, isPaused = false) =>
    jellyfinApi.saveProgress(playableItemId, currentTimeSeconds, isPaused),

  reportStopped: (playableItemId: string, currentTimeSeconds: number) =>
    jellyfinApi.reportStopped(playableItemId, currentTimeSeconds),

  lists: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.slice(1, 4);
    return jellyfinApi.favorites();
  },

  favorites: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.slice(1, 4);
    return jellyfinApi.favorites();
  },

  continueWatching: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.filter((item) => item.progress);
    return jellyfinApi.continueWatching();
  },

  history: async (): Promise<Media[]> => {
    if (useMocks()) return mockMedia.filter((item) => item.progress);
    return jellyfinApi.watched();
  },

  addList: (profileId: string, mediaId: string, listType: string) => {
    void profileId;
    return jellyfinApi.setFavorite(mediaId, listType !== 'DISLIKED');
  },

  settings: async () => jellyfinApi.getSession(),

  saveSettings: async () => undefined
};
