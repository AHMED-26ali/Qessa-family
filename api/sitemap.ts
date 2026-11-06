
import type { Request, Response } from 'express';
import { getChannelVideos } from '../src/server/youtubeService.js';

const BASE_URL = 'https://qessa-family.vercel.app';

const CHANNEL_URL = 'https://www.youtube.com/@Qessa-family';

// Escape text to produce valid XML.
function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(
  req: Request,
  res: Response
) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');

    return res.status(405).send('Method not allowed');
  }

  try {
    // Retrieve the channel videos.
    const result = await getChannelVideos(false);

    // Remove duplicate and invalid video IDs.
    const seen = new Set<string>();

    const videos = result.videos.filter((video) => {
      if (
        !video.id ||
        !/^[A-Za-z0-9_-]{11}$/.test(video.id) ||
        seen.has(video.id)
      ) {
        return false;
      }

      seen.add(video.id);
      return true;
    });

    // Generate an XML entry for each available video.
    const videoUrls = videos
      .map((video) => {
        const videoId = encodeURIComponent(video.id);

        const title = escapeXml(
          video.cleanTitle || video.title ||
          'حكاية من قصة العائلة'
        );

        const description = escapeXml(
          (
            video.description ||
            `حكاية للأطفال من قناة قصة العائلة: ${video.cleanTitle}`
          ).slice(0, 2048)
        );

        const watchUrl = `${BASE_URL}/?v=${videoId}`;

        const thumbnailUrl =
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        const playerUrl =
          `https://www.youtube-nocookie.com/embed/${videoId}`;

        return `  <url>
    <loc>${escapeXml(watchUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${title}</video:title>
      <video:description>${description}</video:description>
      <video:player_loc>${escapeXml(playerUrl)}</video:player_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:uploader info="${escapeXml(CHANNEL_URL)}">قصة العائلة | Qessa Family</video:uploader>
    </video:video>
  </url>`;
      })
      .join('\n');

    // Build the complete video sitemap.
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/?section=games</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${videoUrls}
</urlset>`;

    // Cache live results but not unavailable API fallback.
    if (result.source === 'fallback') {
      res.setHeader('Cache-Control', 'no-store');
    } else {
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=600, stale-while-revalidate=600'
      );
    }

    return res.status(200).send(xml);
  } catch (error) {
    console.error(
      '[Qessa Family] Sitemap generation failed:',
      error
    );

    res.setHeader('Cache-Control', 'no-store');

    return res.status(500).send(
      'Error generating video sitemap'
    );
  }
}
