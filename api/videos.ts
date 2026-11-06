
import type { Request, Response } from 'express';
import {
  getChannelVideos,
  getVideoById,
} from '../src/server/youtubeService.js';

export default async function handler(
  req: Request,
  res: Response
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const rawVideoId = req.query?.id ?? req.query?.v;

    // Fetch a specific video when requested.
    if (rawVideoId !== undefined) {
      res.setHeader('Cache-Control', 'no-store');

      if (
        typeof rawVideoId !== 'string' ||
        !/^[A-Za-z0-9_-]{11}$/.test(rawVideoId)
      ) {
        return res.status(400).json({
          success: false,
          error: 'Invalid video ID',
        });
      }

      const video = await getVideoById(rawVideoId);

      if (!video) {
        return res.status(404).json({
          success: false,
          error: 'Video not found',
        });
      }

      return res.status(200).json({
        success: true,
        video,
      });
    }

    const forceRefresh =
      req.query?.refresh === 'true' ||
      req.query?.force === 'true';

    // Read the channel videos from the server service.
    const result = await getChannelVideos(forceRefresh);

    // Remove duplicate videos without deleting old stories.
    const seen = new Set<string>();

    const uniqueVideos = result.videos.filter((video) => {
      if (!video.id || seen.has(video.id)) {
        return false;
      }

      seen.add(video.id);
      return true;
    });

    // The service supplies videos newest first.
    // Only the first video belongs on the big screen.
    const videos = uniqueVideos.map((video, index) => ({
      ...video,
      isFeatured: index === 0,
    }));

    const featuredVideo = videos[0] ?? null;
    const otherVideos = videos.slice(1);

    // Avoid caching manual refreshes or fallback data.
    if (forceRefresh || result.source === 'fallback') {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
      );
    }

    // Do not report a failed live refresh as successful.
    if (forceRefresh && result.source === 'fallback') {
      return res.status(503).json({
        success: false,
        error: 'YouTube sync unavailable',
        message: 'تعذر جلب أحدث فيديوهات القناة حاليًا',
        source: result.source,
        videos,
      });
    }

    return res.status(200).json({
      success: true,
      channel: '@Qessa-family',
      channelId: result.channelId,

      source: result.source,
      lastSynced: result.lastSynced,
      isCached: result.isCached,

      total: videos.length,

      // Full ordered list for existing website components.
      videos,

      // Latest video for the main large screen.
      featuredVideo,

      // All previous videos for the stories section.
      otherVideos,
    });
  } catch (error) {
    console.error('API /api/videos error:', error);

    res.setHeader('Cache-Control', 'no-store');

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch channel videos',
      message: 'حدث خطأ أثناء تحميل فيديوهات القناة',
    });
  }
}
