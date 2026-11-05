import type { Request, Response } from 'express';
import { getChannelVideos } from '../src/server/youtubeService.js';

export default async function handler(req: Request | any, res: Response | any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const result = await getChannelVideos(true);
    return res.status(200).json({
      success: true,
      message: 'تم تحديث قائمة الحكايات بنجاح',
      total: result.videos.length,
      latestVideo: result.videos[0]?.cleanTitle,
      latestVideoId: result.videos[0]?.id,
      source: result.source,
      lastSynced: result.lastSynced,
      channelId: result.channelId,
    });
  } catch (error: any) {
    console.error('API /api/refresh error:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل التحديث الفوري، يتم استخدام أحدث بيانات محفوظة',
    });
  }
}
