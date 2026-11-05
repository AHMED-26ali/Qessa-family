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

test('3. Server-side YouTube service fetches videos and guarantees newest episode', async () => {
  const result = await getChannelVideos(false);
  assert.equal(result.channelId, 'UChe5CsFfnSS0b6pWN1x3q0w');
  assert.ok(result.videos.length > 0, 'Videos list should not be empty');

  // Verify the newest episode opSJHrJX3mc is present
  const newest = result.videos.find((v) => v.id === 'opSJHrJX3mc');
  assert.ok(newest, 'Newest episode opSJHrJX3mc must be in videos list');
  assert.equal(newest?.cleanTitle, 'الثعلب مكرون وكذبة التفاحة الذهبية');
  assert.equal(newest?.category, 'animals');
});

test('4. Lookup by video ID works for direct links', async () => {
  const video = await getVideoById('opSJHrJX3mc');
  assert.ok(video, 'Should find video opSJHrJX3mc');
  assert.equal(video?.id, 'opSJHrJX3mc');
});
