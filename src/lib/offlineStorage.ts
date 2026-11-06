/**
 * Offline Caching & Low-Connectivity Sync Manager for MediTrust
 */

import { ScanLog } from '../types';

const OFFLINE_BATCH_CACHE_KEY = 'meditrust_offline_batch_manifests_v1';
const OFFLINE_SCAN_QUEUE_KEY = 'meditrust_offline_pending_scans_v1';

export interface CachedBatchManifest {
  batchNumber: string;
  drugName: string;
  manufacturer: string;
  merkleRoot: string;
  expiryDate: string;
  status: 'active' | 'recalled' | 'quarantined';
  cachedAt: number;
}

/**
 * Save verified batch manifests for low-connectivity field verification
 */
export function cacheBatchManifests(manifests: CachedBatchManifest[]): void {
  try {
    localStorage.setItem(OFFLINE_BATCH_CACHE_KEY, JSON.stringify(manifests));
  } catch (err) {
    console.error('Failed to cache batch manifests for offline mode', err);
  }
}

/**
 * Retrieve cached batch manifests
 */
export function getCachedBatchManifests(): CachedBatchManifest[] {
  try {
    const raw = localStorage.getItem(OFFLINE_BATCH_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Queue a scan performed in low-connectivity/offline mode
 */
export function queueOfflineScan(scan: ScanLog): void {
  try {
    const raw = localStorage.getItem(OFFLINE_SCAN_QUEUE_KEY);
    const queue: ScanLog[] = raw ? JSON.parse(raw) : [];
    queue.push(scan);
    localStorage.setItem(OFFLINE_SCAN_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to queue offline scan', err);
  }
}

/**
 * Get pending offline scans awaiting synchronization
 */
export function getPendingOfflineScans(): ScanLog[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SCAN_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear synchronized scans
 */
export function clearPendingOfflineScans(): void {
  try {
    localStorage.removeItem(OFFLINE_SCAN_QUEUE_KEY);
  } catch (err) {
    console.error('Failed to clear offline scan queue', err);
  }
}
