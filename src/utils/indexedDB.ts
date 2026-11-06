/**
 * True IndexedDB persistence layer for Masjed-e Man
 * Handles offline queues, clientUuid deduplication, and sync operations.
 */

import { AttendanceRecord, AuditLog } from '../types';

const DB_NAME = 'MasjedMan_Kankh_DB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: Attendance Records
      if (!db.objectStoreNames.contains('attendances')) {
        const store = db.createObjectStore('attendances', { keyPath: 'id' });
        store.createIndex('syncStatus', 'syncStatus', { unique: false });
        store.createIndex('clientUuid', 'clientUuid', { unique: true });
        store.createIndex('studentId', 'studentId', { unique: false });
        store.createIndex('shamsiDate', 'shamsiDate', { unique: false });
      }

      // Store 2: Offline Pending Queue
      if (!db.objectStoreNames.contains('offlineQueue')) {
        const queueStore = db.createObjectStore('offlineQueue', { keyPath: 'clientUuid' });
        queueStore.createIndex('recordedAt', 'recordedAt', { unique: false });
      }

      // Store 3: Audit Logs
      if (!db.objectStoreNames.contains('auditLogs')) {
        db.createObjectStore('auditLogs', { keyPath: 'id' });
      }

      // Store 4: Snapshot Cache for master entities
      if (!db.objectStoreNames.contains('appCache')) {
        db.createObjectStore('appCache', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.warn('Failed to open IndexedDB, falling back to in-memory/localStorage', request.error);
      reject(request.error);
    };
  });

  return dbPromise;
}

/**
 * Saves attendance record in IndexedDB and adds to offline queue if pending
 */
export async function dbSaveAttendance(record: AttendanceRecord): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction(['attendances', 'offlineQueue'], 'readwrite');
    const attendancesStore = tx.objectStore('attendances');
    const queueStore = tx.objectStore('offlineQueue');

    attendancesStore.put(record);

    if (record.syncStatus === 'pending' || record.syncStatus === 'error') {
      queueStore.put(record);
    } else {
      queueStore.delete(record.clientUuid);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Graceful fallback to localStorage
    const local = localStorage.getItem('mm_fallback_attendances');
    const list: AttendanceRecord[] = local ? JSON.parse(local) : [];
    const idx = list.findIndex(a => a.clientUuid === record.clientUuid);
    if (idx >= 0) list[idx] = record;
    else list.push(record);
    localStorage.setItem('mm_fallback_attendances', JSON.stringify(list));
  }
}

/**
 * Gets all pending attendance records from offline queue
 */
export async function dbGetPendingAttendances(): Promise<AttendanceRecord[]> {
  try {
    const db = await getDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlineQueue', 'readonly');
      const store = tx.objectStore('offlineQueue');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    const local = localStorage.getItem('mm_fallback_attendances');
    if (!local) return [];
    const list: AttendanceRecord[] = JSON.parse(local);
    return list.filter(r => r.syncStatus === 'pending' || r.syncStatus === 'error');
  }
}

/**
 * Updates status of attendance record once synced or failed
 */
export async function dbUpdateAttendanceStatus(
  clientUuid: string,
  newStatus: 'synced' | 'pending' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction(['attendances', 'offlineQueue'], 'readwrite');
    const attendancesStore = tx.objectStore('attendances');
    const queueStore = tx.objectStore('offlineQueue');

    const index = attendancesStore.index('clientUuid');
    const getReq = index.get(clientUuid);

    getReq.onsuccess = () => {
      const record = getReq.result as AttendanceRecord | undefined;
      if (record) {
        record.syncStatus = newStatus;
        if (errorMessage) record.syncError = errorMessage;
        else delete record.syncError;
        attendancesStore.put(record);

        if (newStatus === 'synced') {
          queueStore.delete(clientUuid);
        } else {
          queueStore.put(record);
        }
      }
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error updating attendance in DB', err);
  }
}

/**
 * Saves audit log to IndexedDB
 */
export async function dbSaveAuditLog(log: AuditLog): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('auditLogs', 'readwrite');
    tx.objectStore('auditLogs').put(log);
  } catch {
    // fallback
  }
}

/**
 * Caches application state snapshot
 */
export async function dbSetCache<T>(key: string, data: T): Promise<void> {
  try {
    const db = await getDatabase();
    const tx = db.transaction('appCache', 'readwrite');
    tx.objectStore('appCache').put({ key, data, updatedAt: Date.now() });
  } catch {
    try {
      localStorage.setItem(`mm_cache_${key}`, JSON.stringify(data));
    } catch {
      // quota or blocked
    }
  }
}

/**
 * Retrieves cached application state snapshot
 */
export async function dbGetCache<T>(key: string): Promise<T | null> {
  try {
    const db = await getDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('appCache', 'readonly');
      const req = tx.objectStore('appCache').get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    try {
      const item = localStorage.getItem(`mm_cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}
