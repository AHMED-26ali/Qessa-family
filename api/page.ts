import type { Request, Response } from 'express';
import { isPublicCategory, INFORMATION_PAGES, STORY_LIBRARY_PATH, storyPath, VIDEO_ID } from '../src/site.js';
import { renderCategory, renderInformation, renderLibrary, renderPage, renderStory } from '../src/server/pages.js';
import { getChannelVideos } from '../src/server/youtubeService.js';
import { storyNotes } from '../src/data/storyNotes.js';

export async function servePage(req: Request, res: Response, view: string, id = '') {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }

  if (view === 'info' && Object.hasOwn(INFORMATION_PAGES, '/' + id)) {
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    return res.send(renderInformation(('/' + id) as keyof typeof INFORMATION_PAGES));
  }

  const isStory = view === 'story' && VIDEO_ID.test(id);
  const isCategory = view === 'category' && isPublicCategory(id);
  let retryable = false;

  const isLibrary = view === 'library';
  const rawQuery = req.query.q;
  const query = isLibrary && typeof rawQuery === 'string' ? Array.from(rawQuery.trim()).slice(0, 80).join('') : '';

  if (isStory || isCategory || isLibrary) {
    const { videos, source } = await getChannelVideos();
    res.setHeader('Cache-Control', source === 'fallback' || query
      ? 'no-store'
      : 'public, s-maxage=300, stale-while-revalidate=600');

    if (isLibrary) return res.send(renderLibrary(videos, query));

    if (isStory) {
      const video = videos.find((item) => item.id === id);
      if (video) return res.send(renderStory(video, videos));

      const fullVideoId = storyNotes[id]?.fullVideoId;
      if (fullVideoId && videos.some((item) => item.id === fullVideoId)) {
        return res.redirect(308, storyPath(fullVideoId));
      }

      retryable = source === 'fallback';
    } else if (isPublicCategory(id)) {
      return res.send(renderCategory(id, videos.filter((video) => video.category === id)));
    }
  }

  const title = retryable ? 'تعذّر تحميل الحدوتة مؤقتًا' : 'الصفحة مش موجودة';
  const description = retryable
    ? 'جرّب تاني بعد شوية أو افتح مكتبة الحواديت.'
    : 'تقدر ترجع لمكتبة الحواديت وتختار حدوتة تانية.';
  res.setHeader('Cache-Control', 'no-store');
  if (retryable) res.setHeader('Retry-After', '120');
  return res.status(retryable ? 503 : 404).send(renderPage({
    title, description, pathname: '/404', noindex: true,
    body: `<h1>${title}</h1><p>${description}</p><p><a href="${STORY_LIBRARY_PATH}">مكتبة الحواديت</a></p>`,
  }));
}

export default function handler(req: Request, res: Response) {
  const { view, id } = req.query;
  return servePage(req, res, typeof view === 'string' ? view : '', typeof id === 'string' ? id : '');
}
