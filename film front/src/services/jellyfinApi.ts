import type { HomeResponse, Media, Episode, Season } from '../types/media';
import type { PlaybackInfo } from '../types/playback';
import type { AuthResponse, Profile, User } from '../types/user';

const APP_NAME = 'Zippy';
const APP_VERSION = '0.1.0';
const SERVER_KEY = 'zippy.jellyfin.serverUrl';
const TOKEN_KEY = 'zippy.jellyfin.accessToken';
const USER_ID_KEY = 'zippy.jellyfin.userId';
const USER_KEY = 'zippy.user';
const DEVICE_ID_KEY = 'zippy.jellyfin.deviceId';

type JellyfinUser = {
  Id: string;
  Name: string;
};

type JellyfinAuthResponse = {
  User: JellyfinUser;
  AccessToken: string;
  SessionInfo?: {
    DeviceId?: string;
  };
};

type JellyfinItem = {
  Id: string;
  Name: string;
  Type: 'Movie' | 'Series' | 'Episode' | string;
  Overview?: string;
  ProductionYear?: number;
  PremiereDate?: string;
  OfficialRating?: string;
  RunTimeTicks?: number;
  Genres?: string[];
  CommunityRating?: number;
  SeriesName?: string;
  ParentIndexNumber?: number;
  IndexNumber?: number;
  ChildCount?: number;
  SeriesId?: string;
  SeasonId?: string;
  ImageTags?: {
    Primary?: string;
    Logo?: string;
  };
  BackdropImageTags?: string[];
  UserData?: {
    PlaybackPositionTicks?: number;
    PlayCount?: number;
    Played?: boolean;
    IsFavorite?: boolean;
    PlayedPercentage?: number;
  };
};

type JellyfinItemsResponse = {
  Items: JellyfinItem[];
  TotalRecordCount: number;
};

function createDeviceId() {
  const stored = localStorage.getItem(DEVICE_ID_KEY);
  if (stored) return stored;

  const id = crypto.randomUUID?.() ?? `zippy-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

function normalizeServerUrl(serverUrl: string) {
  return serverUrl.trim().replace(/\/+$/, '');
}

function getServerUrl() {
  return localStorage.getItem(SERVER_KEY) ?? '';
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

function getUserId() {
  return localStorage.getItem(USER_ID_KEY) ?? '';
}

function authHeader(token = getToken()) {
  const tokenPart = token ? `, Token="${token}"` : '';
  return `MediaBrowser Client="${APP_NAME}", Device="Browser", DeviceId="${createDeviceId()}", Version="${APP_VERSION}"${tokenPart}`;
}

async function jellyfinRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const serverUrl = getServerUrl();
  if (!serverUrl) {
    throw new Error('Servidor Jellyfin nao configurado.');
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', authHeader());
  const token = getToken();
  if (token) {
    headers.set('X-Emby-Token', token);
  }

  const response = await fetch(`${serverUrl}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`Jellyfin ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function ticksToSeconds(ticks?: number) {
  return ticks ? Math.floor(ticks / 10_000_000) : 0;
}

function secondsToTicks(seconds: number) {
  return Math.max(0, Math.floor(seconds)) * 10_000_000;
}

function progress(item: JellyfinItem) {
  if (typeof item.UserData?.PlayedPercentage === 'number') {
    return Math.round(item.UserData.PlayedPercentage);
  }

  const runtime = ticksToSeconds(item.RunTimeTicks);
  const watched = ticksToSeconds(item.UserData?.PlaybackPositionTicks);
  return runtime > 0 && watched > 0 ? Math.min(100, Math.round((watched / runtime) * 100)) : undefined;
}

function imageUrl(itemId: string, type: 'Primary' | 'Backdrop', width: number, height?: number) {
  const serverUrl = getServerUrl();
  const token = getToken();
  const size = height ? `fillWidth=${width}&fillHeight=${height}` : `maxWidth=${width}`;
  const backdropIndex = type === 'Backdrop' ? '/0' : '';
  return `${serverUrl}/Items/${itemId}/Images/${type}${backdropIndex}?${size}&quality=92&api_key=${encodeURIComponent(token)}`;
}

function mapMedia(item: JellyfinItem): Media {
  const type = item.Type === 'Series' ? 'SERIES' : 'MOVIE';
  return {
    id: item.Id,
    type,
    title: item.Name,
    year: item.ProductionYear,
    overview: item.Overview,
    posterUrl: imageUrl(item.Id, 'Primary', 420, 630),
    backdropUrl: imageUrl(item.Id, 'Backdrop', 1600, 900),
    voteAverage: item.CommunityRating,
    genre: item.Genres?.[0],
    progress: progress(item),
    playableItemId: item.Type === 'Series' ? undefined : item.Id,
    isFavorite: item.UserData?.IsFavorite,
    runtimeSeconds: ticksToSeconds(item.RunTimeTicks),
    officialRating: item.OfficialRating,
    childCount: item.ChildCount
  };
}

function mapEpisode(item: JellyfinItem): Episode {
  return {
    id: item.Id,
    playableItemId: item.Id,
    episodeNumber: item.IndexNumber ?? 0,
    title: item.Name,
    overview: item.Overview ?? '',
    durationMinutes: Math.round(ticksToSeconds(item.RunTimeTicks) / 60),
    stillUrl: imageUrl(item.Id, 'Primary', 640, 360),
    progress: progress(item),
    isPlayed: item.UserData?.Played
  };
}

function userFromJellyfin(user: JellyfinUser): User {
  return {
    id: user.Id,
    name: user.Name,
    email: user.Name,
    role: 'USER'
  };
}

async function getItems(query: Record<string, string | number | boolean | undefined>) {
  const userId = getUserId();
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const path = `/Users/${userId}/Items?${params.toString()}`;
  const data = await jellyfinRequest<JellyfinItemsResponse>(path);
  return data.Items.map(mapMedia);
}

async function getResumeItems() {
  const userId = getUserId();
  const params = new URLSearchParams({
    MediaTypes: 'Video',
    Recursive: 'true',
    Limit: '30',
    Fields: 'PrimaryImageAspectRatio,Overview,Genres,UserData,RunTimeTicks,ProductionYear,ChildCount'
  });

  const data = await jellyfinRequest<JellyfinItemsResponse>(`/Users/${userId}/Items/Resume?${params.toString()}`);
  return data.Items.filter((item) => item.Type === 'Movie' || item.Type === 'Episode' || item.Type === 'Series').map(mapMedia);
}

export const jellyfinApi = {
  isConfigured() {
    return Boolean(getServerUrl() && getToken() && getUserId());
  },

  getSession() {
    const user = localStorage.getItem(USER_KEY);
    return {
      serverUrl: getServerUrl(),
      userId: getUserId(),
      user: user ? (JSON.parse(user) as User) : null,
      hasToken: Boolean(getToken())
    };
  },

  async login(serverUrlInput: string, username: string, password: string): Promise<AuthResponse> {
    const serverUrl = normalizeServerUrl(serverUrlInput);
    localStorage.setItem(SERVER_KEY, serverUrl);
    createDeviceId();

    const response = await fetch(`${serverUrl}/Users/AuthenticateByName`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader('')
      },
      body: JSON.stringify({ Username: username, Pw: password })
    });

    if (!response.ok) {
      throw new Error('Login Jellyfin falhou.');
    }

    const auth = (await response.json()) as JellyfinAuthResponse;
    const user = userFromJellyfin(auth.User);
    localStorage.setItem(TOKEN_KEY, auth.AccessToken);
    localStorage.setItem(USER_ID_KEY, auth.User.Id);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (auth.SessionInfo?.DeviceId) {
      localStorage.setItem(DEVICE_ID_KEY, auth.SessionInfo.DeviceId);
    }

    return {
      accessToken: auth.AccessToken,
      refreshToken: '',
      expiresAt: '',
      user
    };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async testConnection() {
    await jellyfinRequest('/System/Info/Public');
    return true;
  },

  profiles(): Profile[] {
    const session = this.getSession();
    const name = session.user?.name ?? 'Jellyfin';
    return [{
      id: session.userId || 'jellyfin-user',
      name,
      avatar: name.slice(0, 1).toUpperCase(),
      isKids: false,
      language: 'pt-BR',
      maturityLevel: 'ALL'
    }];
  },

  async home(): Promise<HomeResponse> {
    const [resume, recentMovies, recentSeries, movies, series, favorites] = await Promise.all([
      getResumeItems().catch(() => []),
      this.movies({ limit: 24, sortBy: 'DateCreated', sortOrder: 'Descending' }).catch(() => []),
      this.series({ limit: 24, sortBy: 'DateCreated', sortOrder: 'Descending' }).catch(() => []),
      this.movies({ limit: 80 }).catch(() => []),
      this.series({ limit: 80 }).catch(() => []),
      this.favorites().catch(() => [])
    ]);
    const featured = [...resume, ...recentMovies, ...recentSeries, ...movies, ...series];
    const genreNames = Array.from(new Set([...movies, ...series].map((item) => item.genre).filter(Boolean))).slice(0, 8);
    const genreRows = genreNames.map((genre) => ({
      title: `${genre}`,
      items: [...movies, ...series].filter((item) => item.genre === genre).slice(0, 24)
    })).filter((row) => row.items.length >= 2);
    const topRated = [...movies, ...series]
      .filter((item) => typeof item.voteAverage === 'number')
      .sort((a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0))
      .slice(0, 24);

    return {
      hero: featured[0] ?? null,
      rows: [
        { title: 'Continuar assistindo', items: resume },
        { title: 'Minha lista', items: favorites },
        { title: 'Adicionados recentemente', items: [...recentMovies, ...recentSeries].slice(0, 30) },
        { title: 'Filmes adicionados recentemente', items: recentMovies },
        { title: 'Series adicionadas recentemente', items: recentSeries },
        { title: 'Em destaque', items: featured.slice(0, 30) },
        { title: 'Mais bem avaliados', items: topRated },
        { title: 'Filmes', items: movies.slice(0, 30) },
        { title: 'Series', items: series.slice(0, 30) },
        ...genreRows
      ].filter((row) => row.items.length > 0)
    };
  },

  movies(options: { limit?: number; sortBy?: string; sortOrder?: string } = {}) {
    return getItems({
      IncludeItemTypes: 'Movie',
      Recursive: true,
      SortBy: options.sortBy ?? 'SortName',
      SortOrder: options.sortOrder ?? 'Ascending',
      Limit: options.limit,
      Fields: 'PrimaryImageAspectRatio,Overview,Genres,UserData,RunTimeTicks,ProductionYear,CommunityRating,OfficialRating'
    });
  },

  series(options: { limit?: number; sortBy?: string; sortOrder?: string } = {}) {
    return getItems({
      IncludeItemTypes: 'Series',
      Recursive: true,
      SortBy: options.sortBy ?? 'SortName',
      SortOrder: options.sortOrder ?? 'Ascending',
      Limit: options.limit,
      Fields: 'PrimaryImageAspectRatio,Overview,Genres,UserData,RunTimeTicks,ProductionYear,CommunityRating,OfficialRating,ChildCount'
    });
  },

  async item(id: string) {
    const userId = getUserId();
    const item = await jellyfinRequest<JellyfinItem>(`/Users/${userId}/Items/${id}`);
    return mapMedia(item);
  },

  async seriesDetail(id: string): Promise<Media> {
    const media = await this.item(id);
    const seasonsData = await jellyfinRequest<JellyfinItemsResponse>(`/Shows/${id}/Seasons?UserId=${getUserId()}&Fields=PrimaryImageAspectRatio,Overview,UserData,RunTimeTicks`);
    const seasons: Season[] = await Promise.all(seasonsData.Items.map(async (season) => {
      const episodesData = await jellyfinRequest<JellyfinItemsResponse>(`/Shows/${id}/Episodes?UserId=${getUserId()}&SeasonId=${season.Id}&Fields=PrimaryImageAspectRatio,Overview,UserData,RunTimeTicks`);
      return {
        seasonNumber: season.IndexNumber ?? season.ParentIndexNumber ?? 1,
        title: season.Name,
        episodes: episodesData.Items.map(mapEpisode)
      };
    }));

    return { ...media, seasons, playableItemId: seasons[0]?.episodes.find((episode) => !episode.isPlayed)?.playableItemId ?? seasons[0]?.episodes[0]?.playableItemId };
  },

  async search(query: string) {
    if (!query.trim()) return [];
    return getItems({
      SearchTerm: query,
      Recursive: true,
      IncludeItemTypes: 'Movie,Series',
      Limit: 60,
      Fields: 'PrimaryImageAspectRatio,Overview,Genres,UserData,RunTimeTicks,ProductionYear,CommunityRating,OfficialRating'
    });
  },

  favorites() {
    return getItems({
      Filters: 'IsFavorite',
      Recursive: true,
      IncludeItemTypes: 'Movie,Series',
      Limit: 60,
      Fields: 'PrimaryImageAspectRatio,Overview,Genres,UserData,RunTimeTicks,ProductionYear,CommunityRating,OfficialRating'
    });
  },

  continueWatching() {
    return getResumeItems();
  },

  watched() {
    return getItems({
      Filters: 'IsPlayed',
      Recursive: true,
      IncludeItemTypes: 'Movie,Series,Episode',
      SortBy: 'DatePlayed',
      SortOrder: 'Descending',
      Limit: 60,
      Fields: 'PrimaryImageAspectRatio,Overview,Genres,UserData,RunTimeTicks,ProductionYear,CommunityRating,OfficialRating'
    });
  },

  async playback(itemId: string): Promise<PlaybackInfo> {
    const item = await jellyfinRequest<JellyfinItem>(`/Users/${getUserId()}/Items/${itemId}`);
    const token = getToken();
    const serverUrl = getServerUrl();
    const hlsUrl = `${serverUrl}/Videos/${itemId}/master.m3u8?api_key=${encodeURIComponent(token)}`;
    const directUrl = `${serverUrl}/Videos/${itemId}/stream?static=true&api_key=${encodeURIComponent(token)}`;
    const episodes = item.Type === 'Episode' && item.SeriesId
      ? (await jellyfinRequest<JellyfinItemsResponse>(`/Shows/${item.SeriesId}/Episodes?UserId=${getUserId()}${item.SeasonId ? `&SeasonId=${item.SeasonId}` : ''}&Fields=PrimaryImageAspectRatio,Overview,UserData,RunTimeTicks`).catch(() => ({ Items: [], TotalRecordCount: 0 }))).Items
      : [];
    const currentIndex = episodes.findIndex((episode) => episode.Id === itemId);
    const nextEpisode = currentIndex >= 0 ? episodes[currentIndex + 1] : undefined;
    const displayTitle = item.Type === 'Episode'
      ? `S${item.ParentIndexNumber ?? 1}:E${item.IndexNumber ?? 1} "${item.Name}"`
      : item.Name;

    return {
      playableItemId: itemId,
      title: item.Name,
      displayTitle,
      seriesTitle: item.SeriesName,
      hlsUrl,
      directUrl,
      durationSeconds: ticksToSeconds(item.RunTimeTicks),
      initialPositionSeconds: ticksToSeconds(item.UserData?.PlaybackPositionTicks),
      qualities: ['Auto'],
      audioTracks: ['Padrao'],
      subtitleTracks: ['Desligada'],
      episodes: episodes.map((episode) => ({
        id: episode.Id,
        title: episode.Name,
        seasonNumber: episode.ParentIndexNumber,
        episodeNumber: episode.IndexNumber,
        durationMinutes: Math.round(ticksToSeconds(episode.RunTimeTicks) / 60),
        progress: progress(episode),
        isPlayed: episode.UserData?.Played
      })),
      nextEpisodeId: nextEpisode?.Id
    };
  },

  async reportStart(itemId: string, currentTimeSeconds = 0) {
    const positionTicks = secondsToTicks(currentTimeSeconds);
    const query = new URLSearchParams({
      CanSeek: 'true',
      PlayMethod: 'DirectStream',
      PositionTicks: String(positionTicks)
    });

    await Promise.allSettled([
      jellyfinRequest('/Sessions/Playing', {
        method: 'POST',
        body: JSON.stringify({
          ItemId: itemId,
          CanSeek: true,
          PlayMethod: 'DirectStream',
          PositionTicks: positionTicks,
          IsPaused: false
        })
      }),
      jellyfinRequest(`/Users/${getUserId()}/PlayingItems/${itemId}?${query.toString()}`, {
        method: 'POST'
      })
    ]).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') console.warn('Falha ao reportar inicio no Jellyfin', result.reason);
      });
    });
  },

  async saveProgress(itemId: string, currentTimeSeconds: number, isPaused = false) {
    const positionTicks = secondsToTicks(currentTimeSeconds);
    const query = new URLSearchParams({
      PositionTicks: String(positionTicks),
      PlayMethod: 'DirectStream',
      IsPaused: String(isPaused),
      IsMuted: 'false'
    });

    await Promise.allSettled([
      jellyfinRequest('/Sessions/Playing/Progress', {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          ItemId: itemId,
          PositionTicks: positionTicks,
          IsPaused: isPaused,
          IsMuted: false,
          PlayMethod: 'DirectStream'
        })
      }),
      jellyfinRequest(`/Users/${getUserId()}/PlayingItems/${itemId}/Progress?${query.toString()}`, {
        method: 'POST',
        keepalive: true
      })
    ]).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') console.warn('Falha ao salvar progresso no Jellyfin', result.reason);
      });
    });
  },

  async reportStopped(itemId: string, currentTimeSeconds: number) {
    const positionTicks = secondsToTicks(currentTimeSeconds);
    const query = new URLSearchParams({
      PositionTicks: String(positionTicks),
      PlayMethod: 'DirectStream'
    });

    await Promise.allSettled([
      jellyfinRequest('/Sessions/Playing/Stopped', {
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          ItemId: itemId,
          PositionTicks: positionTicks
        })
      }),
      jellyfinRequest(`/Users/${getUserId()}/PlayingItems/${itemId}?${query.toString()}`, {
        method: 'DELETE',
        keepalive: true
      })
    ]).then((results) => {
      results.forEach((result) => {
        if (result.status === 'rejected') console.warn('Falha ao finalizar playback no Jellyfin', result.reason);
      });
    });
  },

  async setFavorite(itemId: string, favorite: boolean) {
    const method = favorite ? 'POST' : 'DELETE';
    await jellyfinRequest(`/Users/${getUserId()}/FavoriteItems/${itemId}`, { method });
  }
};
