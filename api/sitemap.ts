import type { Request, Response } from 'express';
import { getChannelVideos } from '../src/server/youtubeService.js';

export default async function handler(req: Request | any, res: Response | any) {
  try {
    const { videos } = await getChannelVideos(false);

    const baseUrl = 'https://qessa-family.vercel.app';
    const now = new Date().toISOString();

    const videoUrls = videos
      .map((video) => {
        const cleanTitleEscaped = video.cleanTitle
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const descEscaped = video.description
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        return `  <url>
    <loc>${baseUrl}/?v=${video.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <video:video>
      <video:thumbnail_loc>https://img.youtube.com/vi/${video.id}/hqdefault.jpg</video:thumbnail_loc>
      <video:title>${cleanTitleEscaped}</video:title>
      <video:description>${descEscaped}</video:description>
      <video:player_loc>https://www.youtube-nocookie.com/embed/${video.id}</video:player_loc>
      <video:family_friendly>yes</video:family_friendly>
      <video:uploader info="https://www.youtube.com/@Qessa-family">قصة العائلة | Qessa Family</video:uploader>
    </video:video>
  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?section=games</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${videoUrls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).send(xml);
  } catch (e) {
    res.status(500).send('Error generating sitemap');
  }
}
