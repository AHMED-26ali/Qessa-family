import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeArabic, matchesSearchQuery } from '../src/utils/search.js';
import { OFFICIAL_CHANNEL_ID, OFFICIAL_CHANNEL_HANDLE, getChannelVideos, getVideoById } from '../src/server/youtubeService.js';

test('1. YouTube Channel verification', () => {
  assert.equal(OFFICIAL_CHANNEL_ID, 'UChe5CsFfnSS0b6pWN1x3q0w');
  assert.equal(OFFICIAL_CHANNEL_HANDLE, '@Qessa-family');
});

test('2. Arabic search normalization handles diacritics and Alef variants', () => {
  assert.equal(normalizeArabic('قِصَّةُ الأَمِيرَةِ'), 'قصه الاميره');
  assert.equal(normalizeArabic('سِنْدِرِيلَا'), 'سندريلا');
  assert.equal(normalizeArabic('رَابُونْزِلْ'), 'رابونزل');
  assert.equal(normalizeArabic('١٢٣'), '123');

  // Matching with and without prefixes
  assert.equal(matchesSearchQuery(['الثعلب مكرون وكذبة التفاحة'], 'ثعلب'), true);
  assert.equal(matchesSearchQuery(['الثعلب مكرون وكذبة التفاحة'], 'الثعلب'), true);
  assert.equal(matchesSearchQuery(['سندريلا والحذاء الزجاجي'], 'سندريلا'), true);
  assert.equal(matchesSearchQuery(['الأميرة رابونزل'], 'اميره'), true);
});

test('3. Server-side YouTube service includes earlier stories', async () => {
  const result = await getChannelVideos(false);
  assert.equal(result.channelId, 'UChe5CsFfnSS0b6pWN1x3q0w');
  assert.ok(result.videos.length > 0, 'Videos list should not be empty');

  const foxStory = result.videos.find((v) => v.id === 'opSJHrJX3mc');
  assert.ok(foxStory, 'The library should still include the fox story');
  assert.equal(foxStory.cleanTitle, 'الثعلب مكرون وكذبة التفاحة');
  assert.equal(foxStory.category, 'animals');
});

test('4. Lookup by video ID works for direct links', async () => {
  const video = await getVideoById('opSJHrJX3mc');
  assert.ok(video, 'Should find video opSJHrJX3mc');
  assert.equal(video?.id, 'opSJHrJX3mc');
});

test('Regular uploads keep short-duration stories and exclude known clips', async (t) => {
  const fullStoryId = 'dwjIpE3v2kY';
  const shortClipId = '490MWmufuIA';
  const savedKey = process.env.YOUTUBE_API_KEY;
  process.env.YOUTUBE_API_KEY = 'test-key';
  t.after(() => {
    if (savedKey === undefined) delete process.env.YOUTUBE_API_KEY;
    else process.env.YOUTUBE_API_KEY = savedKey;
  });

  const requests: URL[] = [];
  t.mock.method(globalThis, 'fetch', async (input: string) => {
    const url = new URL(input);
    requests.push(url);

    if (url.pathname.endsWith('/playlistItems')) {
      return Response.json({
        items: [shortClipId, fullStoryId].map((videoId) => ({ contentDetails: { videoId } })),
      });
    }

    return Response.json({
      items: [shortClipId, fullStoryId].map((id) => ({
        id,
        snippet: { title: 'حكاية من القناة', channelId: OFFICIAL_CHANNEL_ID },
        contentDetails: { duration: 'PT1M45S' },
        status: { privacyStatus: 'public', embeddable: true },
      })),
    });
  });

  const [result, concurrent] = await Promise.all([getChannelVideos(true), getChannelVideos(true)]);
  assert.strictEqual(concurrent, result);
  assert.equal(requests.length, 2);
  assert.equal(requests[0]?.searchParams.get('playlistId'), `UULF${OFFICIAL_CHANNEL_ID.slice(2)}`);
  assert.equal(result.source, 'api');
  assert.deepEqual(result.videos.map(({ id }) => id), [fullStoryId]);
  assert.equal(result.videos[0]?.duration, '1:45');
  assert.equal(result.videos[0]?.isFeatured, true);
  assert.equal(await getVideoById(shortClipId), null);
});
