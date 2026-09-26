import { VideoStory } from '../types';
import { INITIAL_VIDEOS, CHANNEL_NAME } from '../data/videos';

const STORAGE_KEY_CUSTOM_VIDEOS = 'qessa_custom_latest_videos_v1';
export const CHANNEL_ID = 'UC50D2u7E-E_0rS6bXm2m_CA';

/**
 * Load videos merging any dynamically fetched new episodes with default initial videos
 */
export function loadAllVideos(): VideoStory[] {
  if (typeof window === 'undefined') return INITIAL_VIDEOS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_VIDEOS);
    if (saved) {
      const parsed: VideoStory[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Deduplicate with INITIAL_VIDEOS by id, placing newest first
        const seen = new Set<string>();
        const combined: VideoStory[] = [];

        for (const v of [...parsed, ...INITIAL_VIDEOS]) {
          if (!seen.has(v.id)) {
            seen.add(v.id);
            combined.push(v);
          }
        }
        return combined;
      }
    }
  } catch (e) {
    console.error('Error loading custom videos:', e);
  }
  return INITIAL_VIDEOS;
}

/**
 * Save newly detected videos to localStorage
 */
export function saveCustomVideos(newVideos: VideoStory[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_VIDEOS, JSON.stringify(newVideos));
  } catch (e) {
    console.error('Failed to save videos:', e);
  }
}

/**
 * Fetch latest videos published by @Qessa-family from YouTube RSS via public CORS gateways
 */
export async function fetchLatestChannelEpisodes(): Promise<VideoStory[]> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
  
  // List of public CORS proxies to try
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
  ];

  for (const endpoint of proxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const xmlText = await res.text();
      if (!xmlText.includes('<feed') && !xmlText.includes('<entry')) continue;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
      const entries = Array.from(xmlDoc.querySelectorAll('entry'));

      if (entries.length === 0) continue;

      const fetchedStories: VideoStory[] = entries.map((entry, index) => {
        const videoId = entry.querySelector('videoId')?.textContent ||
                        entry.querySelector('id')?.textContent?.replace('yt:video:', '') ||
                        '';
        const rawTitle = entry.querySelector('title')?.textContent || 'حلقة كرتونية جديدة';
        const description = entry.querySelector('description')?.textContent ||
                            entry.querySelector('summary')?.textContent ||
                            'حلقة جديدة وممتعة للأطفال من قناة قصة العائلة.';
        const publishedDate = entry.querySelector('published')?.textContent || '';

        // Clean Title
        let cleanTitle = rawTitle
          .replace(/حواديت قبل النوم/g, '')
          .replace(/كرتون اطفال بالعربي/g, '')
          .replace(/رسوم متحركة/g, '')
          .replace(/\|/g, '')
          .trim();
        if (!cleanTitle) cleanTitle = rawTitle;

        // Categorize based on keywords in title
        let category: VideoStory['category'] = 'all';
        let categoryNameAr = 'كل الحكايات';
        const lower = rawTitle.toLowerCase();

        if (lower.includes('أمير') || lower.includes('امير') || lower.includes('سندريلا') || lower.includes('رابونزل')) {
          category = 'princesses';
          categoryNameAr = 'قصص الأميرات';
        } else if (lower.includes('نوم') || lower.includes('حدوتة قبل النوم')) {
          category = 'bedtime';
          categoryNameAr = 'حواديت قبل النوم';
        } else if (lower.includes('حيوان') || lower.includes('غابة') || lower.includes('كلب') || lower.includes('أسد')) {
          category = 'animals';
          categoryNameAr = 'حيوانات الغابة';
        } else if (lower.includes('فضاء') || lower.includes('حلوى') || lower.includes('سفر')) {
          category = 'fantasy';
          categoryNameAr = 'خيال وفضاء ومرح';
        } else if (lower.includes('سندباد') || lower.includes('مغامرة') || lower.includes('تنين')) {
          category = 'adventure';
          categoryNameAr = 'مغامرات وأساطير';
        }

        return {
          id: videoId,
          title: rawTitle,
          cleanTitle,
          description: description.slice(0, 160) + (description.length > 160 ? '...' : ''),
          category,
          categoryNameAr,
          duration: 'جديد',
          viewsApprox: 'جديد',
          isFeatured: index === 0,
          ageRecommendation: '3+' as const,
          moralLesson: 'قيم نبيلة ومغامرة شيقة للأطفال',
          publishedDate: index === 0 ? 'أحدث حلقة تم نشرها 🚀' : 'حلقة حديثة',
        };
      }).filter((item) => item.id.length > 0);

      if (fetchedStories.length > 0) {
        return fetchedStories;
      }
    } catch (err) {
      // Continue to next proxy
    }
  }

  return [];
}
