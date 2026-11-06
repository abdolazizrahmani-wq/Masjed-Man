/**
 * Safe localStorage helpers: never throw, never crash the app on corrupt data.
 */

type StorageListener = (failedKey: string) => void;
const listeners = new Set<StorageListener>();

/** Subscribe to write failures (quota exceeded, blocked storage, ...). */
export function onStorageWriteError(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Reads and parses a JSON value. Returns `fallback` when the key is missing,
 * the JSON is corrupt, or the optional validator rejects the shape.
 */
export function loadJSON<T>(key: string, fallback: T, validate?: (value: unknown) => boolean): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/** Writes a JSON value. Returns false (and notifies listeners) on failure. */
export function saveJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    listeners.forEach(l => l(key));
    return false;
  }
}

export function loadString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    listeners.forEach(l => l(key));
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export const isArray = (v: unknown): boolean => Array.isArray(v);
