
import type { Request, Response } from 'express';
import { getChannelVideos } from '../src/server/youtubeService.js';

export default async function handler(
  req: Request,
  res: Response
) {
  // Allow refresh requests from the website
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type'
  );

  // Never cache manual refresh responses
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');

    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'طريقة الطلب غير مدعومة'
    });
  }

  try {
    // Request a fresh synchronization from YouTube
    const result = await getChannelVideos(true);

    // Keep unique videos in their original newest-first order
    const seen = new Set<string>();

    const videos = result.videos.filter((video) => {
      if (!video.id || seen.has(video.id)) {
        return false;
      }

      seen.add(video.id);
      return true;
    });

    // The newest video becomes the featured story
    const latestVideo = videos[0] ?? null;

    // Every previous video remains in the stories collection
    const otherVideos = videos.slice(1);

    // YouTube could not be reached successfully
    if (result.source === 'fallback') {
      return res.status(503).json({
        success: false,
        updated: false,
        message: 'تعذر الاتصال بيوتيوب حاليًا. القصص المحفوظة ما زالت متاحة.',
        source: result.source,
        total: videos.length,
        latestVideo: latestVideo?.cleanTitle ?? null,
        latestVideoId: latestVideo?.id ?? null,
        lastSynced: result.lastSynced,
        channelId: result.channelId
      });
    }

    // A cooldown may return cached data without a new fetch
    const updated = !result.isCached;

    return res.status(200).json({
      success: true,
      updated,
      message: updated
        ? 'تمت مزامنة فيديوهات قناة قصة العائلة بنجاح'
        : 'تم عرض آخر بيانات محفوظة. لم يتم إجراء مزامنة جديدة الآن.',

      channel: '@Qessa-family',
      channelId: result.channelId,

      source: result.source,
      lastSynced: result.lastSynced,
      isCached: result.isCached,

      total: videos.length,

      latestVideo: latestVideo?.cleanTitle ?? null,
      latestVideoId: latestVideo?.id ?? null,

      featuredVideoId: latestVideo?.id ?? null,
      otherVideosCount: otherVideos.length
    });
  } catch (error) {
    console.error('API /api/refresh error:', error);

    return res.status(500).json({
      success: false,
      updated: false,
      error: 'YouTube refresh failed',
      message: 'حدث خطأ أثناء تحديث الحكايات. حاول مرة أخرى.'
    });
  }
}
