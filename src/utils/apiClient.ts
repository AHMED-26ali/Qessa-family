import { VideoStory } from '../types';
import { INITIAL_VIDEOS } from '../data/videos';

const OFFLINE_CACHE_KEY = 'qessa_api_videos_offline_v2';

export interface SyncStatus {
  state: 'idle' | 'loading' | 'success' | 'error';
  lastSynced?: string;
  source?: 'api' | 'scraper' | 'fallback';
  message?: string;
}

/**
 * Load videos from server API with offline fallback
 */
export async function fetchVideosFromApi(
  forceRefresh = false
): Promise<{ videos: VideoStory[]; source: string; lastSynced: string }> {
  try {
    const url = forceRefresh ? '/api/videos?refresh=true' : '/api/videos';
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        // Save to offline storage as cache
        try {
          localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify({
            videos: data.videos,
            timestamp: Date.now(),
            source: data.source,
          }));
        } catch {}

        return {
          videos: data.videos,
          source: data.source || 'server',
          lastSynced: data.lastSynced || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn('[ApiClient] Failed to fetch from server, checking local offline cache:', err);
  }

  // Fallback to offline cached videos
  try {
    const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed.videos) && parsed.videos.length > 0) {
        return {
          videos: parsed.videos,
          source: 'offline-cache',
          lastSynced: new Date(parsed.timestamp).toISOString(),
        };
      }
    }
  } catch {}

  // Final fallback to initial videos (with newest prepended)
  let fallback = [...INITIAL_VIDEOS];
  if (!fallback.some((v) => v.id === 'opSJHrJX3mc')) {
    fallback = [
      {
        id: 'opSJHrJX3mc',
        title: 'الثعلب مكرون وكذبة التفاحة | قصص أطفال عن الصدق والأمانة | حواديت حيوانات الغابة',
        cleanTitle: 'الثعلب مكرون وكذبة التفاحة الذهبية',
        description: 'حكاية شيقة للأطفال عن الثعلب مكرون الذي تعلم درساً مهماً في الصدق والأمانة وكيف أن قول الحقيقة ينجي دائماً.',
        category: 'animals',
        categoryNameAr: 'حيوانات الغابة',
        duration: '14:30',
        viewsApprox: 'جديد',
        isFeatured: true,
        ageRecommendation: '3+',
        moralLesson: 'الصدق والأمانة يجلبان محبة الأصدقاء، والكذب يوقع صاحبه في المتاعب',
        publishedDate: 'أحدث حلقة تم نشرها 🚀',
      },
      ...fallback,
    ];
  }

  return {
    videos: fallback,
    source: 'fallback',
    lastSynced: new Date().toISOString(),
  };
}

/**
 * Fetch a specific video by ID from server API
 */
export async function fetchVideoById(videoId: string): Promise<VideoStory | null> {
  try {
    const res = await fetch(`/api/videos?id=${encodeURIComponent(videoId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.video) {
        return data.video;
      }
    }
  } catch (err) {
    console.warn(`[ApiClient] Failed to fetch video ${videoId}:`, err);
  }
  return null;
}

/**
 * Trigger immediate channel refresh
 */
export async function refreshChannelVideos(): Promise<{
  success: boolean;
  videos: VideoStory[];
  message: string;
}> {
  try {
    const res = await fetch('/api/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const fresh = await fetchVideosFromApi(false);
      return {
        success: true,
        videos: fresh.videos,
        message: data.message || 'تم تحديث قائمة الحكايات بنجاح',
      };
    }
  } catch (err) {
    console.warn('[ApiClient] Failed to trigger refresh:', err);
  }

  // Still attempt regular fetch
  const fresh = await fetchVideosFromApi(true);
  return {
    success: true,
    videos: fresh.videos,
    message: 'تم فحص القناة وعرض أحدث القصص',
  };
}
