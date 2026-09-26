/**
 * Arabic text normalization and fuzzy token search utilities
 * Handles Arabic diacritics (tashkeel), alef variants (أ إ آ ٱ -> ا),
 * teh marbuta (ة -> ه), and alef maksura (ى -> ي).
 */

export const normalizeArabic = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel/diacritics
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[^\w\u0600-\u06FF\s]/g, ' ') // replace punctuation/symbols with spaces
    .replace(/\s+/g, ' ')
    .trim();
};

export const matchesSearchQuery = (
  fields: (string | undefined | null)[],
  query: string
): boolean => {
  const normQuery = normalizeArabic(query);
  if (!normQuery) return true;

  const tokens = normQuery.split(' ').filter(Boolean);
  if (tokens.length === 0) return true;

  const combinedNormalizedText = fields
    .filter(Boolean)
    .map((f) => normalizeArabic(f))
    .join(' ');

  // All tokens in the user query must match somewhere in the fields
  return tokens.every((token) => combinedNormalizedText.includes(token));
};
