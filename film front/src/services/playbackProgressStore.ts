const STORAGE_KEY = 'zippy.playbackProgress.v1';
const RESUME_MARGIN_SECONDS = 20;

export type StoredPlaybackProgress = {
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: number;
};

type ProgressMap = Record<string, StoredPlaybackProgress>;

function readMap(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as ProgressMap;
  } catch {
    return {};
  }
}

function writeMap(value: ProgressMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function getStoredPlaybackProgress(itemId: string | undefined) {
  if (!itemId) return undefined;
  const entry = readMap()[itemId];
  if (!entry) return undefined;

  const isFinished = entry.durationSeconds > 0 && entry.positionSeconds >= entry.durationSeconds - RESUME_MARGIN_SECONDS;
  return isFinished ? undefined : entry;
}

export function listStoredPlaybackProgress() {
  return Object.entries(readMap())
    .map(([itemId, progress]) => ({ itemId, ...progress }))
    .filter((entry) => {
      return !entry.durationSeconds || entry.positionSeconds < entry.durationSeconds - RESUME_MARGIN_SECONDS;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveStoredPlaybackProgress(itemId: string | undefined, positionSeconds: number, durationSeconds: number) {
  if (!itemId || positionSeconds <= 0) return;

  const current = readMap();
  const isFinished = durationSeconds > 0 && positionSeconds >= durationSeconds - RESUME_MARGIN_SECONDS;
  if (isFinished) {
    delete current[itemId];
  } else {
    current[itemId] = {
      positionSeconds: Math.floor(positionSeconds),
      durationSeconds: Math.floor(durationSeconds || 0),
      updatedAt: Date.now()
    };
  }

  writeMap(current);
}

export function clearStoredPlaybackProgress(itemId: string | undefined) {
  if (!itemId) return;
  const current = readMap();
  delete current[itemId];
  writeMap(current);
}
