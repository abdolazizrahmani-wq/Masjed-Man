/**
 * Sync adapter for offline attendance records.
 *
 * - If VITE_API_URL is set, records are POSTed to `${VITE_API_URL}/attendances/sync`
 *   (idempotent by `clientUuid`). The server must answer
 *   `{ synced: string[]; failed: { clientUuid: string; error: string }[] }`.
 * - If it is NOT set, the app runs in local-only mode: records are kept on this
 *   device and treated as saved (there is nothing to sync them to).
 */

import { AttendanceRecord } from '../types';

const API_URL: string | undefined = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

export const isBackendConfigured = Boolean(API_URL);

export interface SyncResult {
  synced: string[];
  failed: { clientUuid: string; error: string }[];
}

export async function pushAttendances(records: AttendanceRecord[]): Promise<SyncResult> {
  if (!API_URL) {
    return { synced: records.map(r => r.clientUuid), failed: [] };
  }

  try {
    const res = await fetch(`${API_URL}/attendances/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ records }),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = (await res.json()) as Partial<SyncResult>;
    return { synced: data.synced ?? [], failed: data.failed ?? [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'خطای نامشخص شبکه';
    return {
      synced: [],
      failed: records.map(r => ({ clientUuid: r.clientUuid, error: message })),
    };
  }
}
