/**
 * Comprehensive Arabic text normalization and intelligent search utility
 * Handles:
 * - Tashkeel (harakat / diacritics: Fatha, Damma, Kasra, Tanween, Shadda, Sukun)
 * - Alef variants (أ, إ, آ, ٱ -> ا)
 * - Teh Marbuta (ة -> ه)
 * - Alef Maksura (ى -> ي)
 * - Hamza forms (ؤ, ئ -> ء)
 * - Tatweel / Kashida (ـ)
 * - Eastern Arabic numerals (٠-٩ -> 0-9)
 * - Punctuation and symbols
 */

export const normalizeArabic = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // Remove tashkeel & tatweel
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[ؤئ]/g, 'ء')
    // Normalize Eastern Arabic digits to Western digits
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[^\w\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if search query matches any of the candidate fields
 */
export const matchesSearchQuery = (
  fields: (string | undefined | null | string[])[],
  query: string
): boolean => {
  const normQuery = normalizeArabic(query);
  if (!normQuery) return true;

  const tokens = normQuery.split(' ').filter(Boolean);
  if (tokens.length === 0) return true;

  // Flatten and normalize all fields
  const flatFields: string[] = [];
  for (const item of fields) {
    if (Array.isArray(item)) {
      flatFields.push(...item.filter(Boolean));
    } else if (item) {
      flatFields.push(item);
    }
  }

  const combinedNormalized = flatFields.map((f) => normalizeArabic(f)).join(' ');

  // Every token must match somewhere in the text
  return tokens.every((token) => {
    if (combinedNormalized.includes(token)) return true;
    // Also try matching without definite article 'ال' if token starts with 'ال'
    if (token.startsWith('ال') && token.length > 3) {
      const stripped = token.slice(2);
      if (combinedNormalized.includes(stripped)) return true;
    }
    return false;
  });
};
