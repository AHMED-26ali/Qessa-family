import type { Request, Response } from 'express';
import { SITE_URL, STORY_LIBRARY_PATH, VIDEO_ID, categoryPath, INFORMATION_PAGES, isPublicCategory, playerUrl, storyPath, thumbnailUrl } from '../src/site.js';
import { escapeMarkup, storyDescription, storyTitle } from '../src/server/pages.js';
import { excerpt } from '../src/utils/text.js';
import { getChannelVideos } from '../src/server/youtubeService.js';

function xmlText(value: string) {
  return escapeMarkup(value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''));
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  const { videos, source } = await getChannelVideos();
  const validVideos = [...new Map(videos.filter((video) => VIDEO_ID.test(video.id)).map((video) => [video.id, video])).values()];
  const categories = [...new Set(validVideos.map((video) => video.category).filter(isPublicCategory))];
  const paths = ['/', STORY_LIBRARY_PATH, ...Object.keys(INFORMATION_PAGES), ...categories.map(categoryPath)];

  const pages = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`);
  const stories = validVideos.map((video) => `  <url>
    <loc>${SITE_URL}${storyPath(video.id)}</loc>
    <video:video>
      <video:thumbnail_loc>${thumbnailUrl(video.id)}</video:thumbnail_loc>
      <video:title>${xmlText(storyTitle(video))}</video:title>
      <video:description>${xmlText(excerpt(storyDescription(video), 2048))}</video:description>
      <video:player_loc>${xmlText(playerUrl(video.id))}</video:player_loc>
      ${video.uploadDate ? `<video:publication_date>${xmlText(video.uploadDate)}</video:publication_date>` : ''}
    </video:video>
  </url>`);

  res.setHeader('Cache-Control', source === 'fallback' ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=30');
  return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${[...pages, ...stories].join('\n')}
</urlset>`);
}
