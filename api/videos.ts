import type { Request, Response } from 'express';
import { getChannelVideos, getVideoById } from '../src/server/youtubeService.js';

export default async function handler(req: Request | any, res: Response | any) {
  // CORS & Cache headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const videoId = (req.query?.id || req.query?.v) as string | undefined;
    const forceRefresh = req.query?.refresh === 'true' || req.query?.force === 'true';

    if (videoId) {
      const video = await getVideoById(videoId);
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

    const result = await getChannelVideos(forceRefresh);

    // Stale-while-revalidate caching header
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );

    return res.status(200).json({
      success: true,
      channel: '@Qessa-family',
      channelId: result.channelId,
      source: result.source,
      lastSynced: result.lastSynced,
      isCached: result.isCached,
      total: result.videos.length,
      videos: result.videos,
    });
  } catch (error: any) {
    console.error('API /api/videos error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch channel videos',
      message: 'الخدمة تعمل بنظام البيانات الاحتياطية',
    });
  }
}
