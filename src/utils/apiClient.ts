
import type { VideoStory } from '../types';
import { INITIAL_VIDEOS } from '../data/videos';

const OFFLINE_CACHE_KEY = 'qessa_api_videos_offline_v2';

export interface SyncStatus {
  state: 'idle' | 'loading' | 'success' | 'error';
  lastSynced?: string;
  source?: 'api' | 'scraper' | 'fallback' | 'offline-cache';
  message?: string;
}

interface VideoFetchResult {
  videos: VideoStory[];
  source: string;
  lastSynced: string;
}

/**
 * Keep videos in the order supplied by the server.
 * Remove duplicates and feature only the newest story.
 */
function normalizeVideos(input: unknown): VideoStory[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const seen = new Set<string>();

  return input
    .filter((video): video is VideoStory => {
      if (
        !video ||
        typeof video !== 'object' ||
        typeof video.id !== 'string' ||
        !video.id
      ) {
        return false;
      }

      if (seen.has(video.id)) {
        return false;
      }

      seen.add(video.id);
      return true;
    })
    .map((video, index) => ({
      ...video,
      isFeatured: index === 0,
    }));
}

/**
 * Save successfully fetched live videos for offline use.
 */
function saveOfflineCache(
  videos: VideoStory[],
  source: string,
  lastSynced: string
): void {
  try {
    localStorage.setItem(
      OFFLINE_CACHE_KEY,
      JSON.stringify({
        videos,
        timestamp: Date.now(),
        source,
        lastSynced,
      })
    );
  } catch (error) {
    console.warn('[ApiClient] Could not save offline cache:', error);
  }
}

/**
 * Restore the most recently saved list when offline.
 */
function readOfflineCache(): VideoFetchResult | null {
  try {
    const stored = localStorage.getItem(OFFLINE_CACHE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    const videos = normalizeVideos(parsed.videos);

    if (videos.length === 0) {
      return null;
    }

    const timestamp =
      typeof parsed.timestamp === 'number' &&
      Number.isFinite(parsed.timestamp)
        ? parsed.timestamp
        : 0;

    const lastSynced =
      typeof parsed.lastSynced === 'string'
        ? parsed.lastSynced
        : timestamp > 0
          ? new Date(timestamp).toISOString()
          : '';

    return {
      videos,
      source: 'offline-cache',
      lastSynced,
    };
  } catch (error) {
    console.warn('[ApiClient] Offline cache unavailable:', error);
    return null;
  }
}

/**
 * Use bundled stories only when the live API and
 * offline cache are unavailable.
 */
function getInitialFallback(): VideoFetchResult {
  return {
    videos: normalizeVideos(INITIAL_VIDEOS),
    source: 'fallback',
    lastSynced: '',
  };
}

/**
 * Fetch all channel videos from the server API.
 * The server must return newest videos first.
 */
export async function fetchVideosFromApi(
  forceRefresh = false
): Promise<VideoFetchResult> {
  try {
    const url = forceRefresh
      ? '/api/videos?refresh=true'
      : '/api/videos';

    const response = await fetch(url, {
      method: 'GET',
      cache: forceRefresh ? 'no-store' : 'default',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Video API returned HTTP ${response.status}`
      );
    }

    const data = await response.json();

    if (
      !data.success ||
      data.source === 'fallback' ||
      !Array.isArray(data.videos)
    ) {
      throw new Error('Live YouTube data unavailable');
    }

    const videos = normalizeVideos(data.videos);

    if (videos.length === 0) {
      throw new Error('No valid videos returned');
    }

    const source =
      typeof data.source === 'string'
        ? data.source
        : 'server';

    const lastSynced =
      typeof data.lastSynced === 'string'
        ? data.lastSynced
        : new Date().toISOString();

    saveOfflineCache(videos, source, lastSynced);

    return {
      videos,
      source,
      lastSynced,
    };
  } catch (error) {
    console.warn(
      '[ApiClient] Live videos unavailable:',
      error
    );
  }

  // Never replace a saved newer list with old bundled data.
  const offline = readOfflineCache();

  if (offline) {
    return offline;
  }

  return getInitialFallback();
}

/**
 * Fetch a single video from the server.
 */
export async function fetchVideoById(
  videoId: string
): Promise<VideoStory | null> {
  try {
    const response = await fetch(
      `/api/videos?id=${encodeURIComponent(videoId)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.video) {
        return data.video as VideoStory;
      }
    }
  } catch (error) {
    console.warn(
      `[ApiClient] Could not fetch video ${videoId}:`,
      error
    );
  }

  // Check previously saved videos if the server fails.
  const offline = readOfflineCache();

  if (offline) {
    const found = offline.videos.find(
      (video) => video.id === videoId
    );

    if (found) {
      return found;
    }
  }

  return (
    INITIAL_VIDEOS.find((video) => video.id === videoId) ??
    null
  );
}

/**
 * Trigger a manual channel refresh.
 * Only report success when live synchronization succeeds.
 */
export async function refreshChannelVideos(): Promise<{
  success: boolean;
  videos: VideoStory[];
  message: string;
}> {
  let failureMessage =
    'تعذر الاتصال بيوتيوب. تم الاحتفاظ بالقصص المتاحة.';

  try {
    const response = await fetch('/api/refresh', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (
      !response.ok ||
      !data.success ||
      data.source === 'fallback'
    ) {
      failureMessage =
        data.message ||
        'فشل تحديث الفيديوهات من يوتيوب.';

      throw new Error(failureMessage);
    }

    // Fetch the updated list without using the old HTTP cache.
    const fresh = await fetchVideosFromApi(true);

    const hasLiveVideos =
      (fresh.source === 'api' ||
        fresh.source === 'scraper') &&
      fresh.videos.length > 0;

    const actuallyUpdated =
      hasLiveVideos && data.updated !== false;

    return {
      success: actuallyUpdated,
      videos: fresh.videos,
      message: actuallyUpdated
        ? 'تم تحديث الحكايات من قناة قصة العائلة بنجاح.'
        : data.updated === false
          ? 'لم تتم مزامنة جديدة الآن. تم الاحتفاظ بآخر القصص المتاحة.'
          : 'تعذر تأكيد جلب فيديوهات جديدة. تم الاحتفاظ بالقصص المتاحة.',
    };
  } catch (error) {
    console.warn(
      '[ApiClient] Channel refresh failed:',
      error
    );
  }

  const availableVideos =
    readOfflineCache() ?? getInitialFallback();

  return {
    success: false,
    videos: availableVideos.videos,
    message: failureMessage,
  };
}
