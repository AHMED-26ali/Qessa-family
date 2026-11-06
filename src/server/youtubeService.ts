
import type { VideoStory, StoryCategory } from '../types.js';
import { INITIAL_VIDEOS } from '../data/videos.js';

try {
  process.loadEnvFile?.();
} catch {}

export const OFFICIAL_CHANNEL_HANDLE = '@Qessa-family';

const DEFAULT_CHANNEL_ID = 'UChe5CsFfnSS0b6pWN1x3q0w';
const configuredChannelId = process.env.YOUTUBE_CHANNEL_ID?.trim();

export const OFFICIAL_CHANNEL_ID =
  configuredChannelId && /^UC[A-Za-z0-9_-]{22}$/.test(configuredChannelId)
    ? configuredChannelId
    : DEFAULT_CHANNEL_ID;

export const OFFICIAL_UPLOADS_PLAYLIST_ID =
  `UU${OFFICIAL_CHANNEL_ID.slice(2)}`;

interface CacheEntry {
  videos: VideoStory[];
  timestamp: number;
  source: 'api' | 'scraper' | 'fallback';
}

let memoryCache: CacheEntry | null = null;

const CACHE_TTL_MS = 10 * 60 * 1000;
const REFRESH_COOLDOWN_MS = 25 * 1000;

let lastManualRefreshTime = 0;

const CURATED_METADATA: Record<string, Partial<VideoStory>> = {
  opSJHrJX3mc: {
    cleanTitle: 'الثعلب مكرون وكذبة التفاحة الذهبية',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'الصدق والأمانة يجلبان محبة الأصدقاء، والكذب يوقع صاحبه في المتاعب',
  },
  S5h4O4sRkNA: {
    cleanTitle: 'قصة الكلب بولت والقوى الخارقة',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'الشجاعة والوفاء للأصدقاء أعظم من أي قوة خارقة',
  },
  zKilkVjn7Ac: {
    cleanTitle: 'عائلة روبنسون والسفر عبر الزمن',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '5+',
    moralLesson: 'الاستمرار في المحاولة وعدم الاستسلام أمام الفشل',
  },
  QIRsBZCPd9A: {
    cleanTitle: 'رايا وآخر تنين الأسطوري',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'الثقة بالآخرين والتسامح هما سر السلام والمحبة',
  },
  '9DrJ_7Ddios': {
    cleanTitle: 'فأر المدينة وفأر الريف',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'القناعة وراحة البال في البساطة أفضل من ثراء محفوف بالمخاطر',
  },
  cbT1OM0JLIQ: {
    cleanTitle: 'فاسيليسا الجميلة والدمية السحرية',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '5+',
    moralLesson: 'الطيبة ونقاء القلب ينتصران دائماً على الشر',
  },
  'v6v0t-NU2lU': {
    cleanTitle: 'السندباد البحري وجزيرة الحوت العملاق',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'اليقظة وحسن التصرف وسرعة البديهة في مواجهة المفاجآت',
  },
  c65YTzRJocc: {
    cleanTitle: 'الطائر الناري والريشة الذهبية',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'حماية الطبيعة والطيور البرية بأمانة',
  },
  R1Ye9JEUJLk: {
    cleanTitle: 'صائد الوحوش موموتارو ومغامرة الخوخة',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'التعاون مع الأصدقاء يصنع المعجزات في وجه الصعاب',
  },
  'ORv1-Y50SHg': {
    cleanTitle: 'سباق الأرنب المغرور والسلحفاة الصبورة',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'المثابرة والعمل الجاد يهزمان الغرور والكسل دائماً',
  },
  '6tcXaaGfyPU': {
    cleanTitle: 'حورية البحر الصغيرة أريال',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'أهمية الحوار مع الوالدين واحترام التنوع بين العوالم',
  },
  '9cU6aHwBJYQ': {
    cleanTitle: 'سندريلا وضيوف القصر المرحين',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'المرح واللطف في التعامل مع الأصدقاء والضيوف',
  },
  'xPy-X37grbU': {
    cleanTitle: 'الأميرة والضفدع والوعد الصادق',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'الوفاء بالوعد وعدم الحكم على الأشخاص بمظاهرهم الخارجية',
  },
  sY0vry6WyBc: {
    cleanTitle: 'راعي الغنم وأهمية الصدق',
    category: 'bedtime',
    categoryNameAr: 'حواديت قبل النوم',
    ageRecommendation: '3+',
    moralLesson: 'الصدق منجاة، والكذب يفقد صاحبه ثقة الآخرين ومساعدتهم',
  },
  PyklIdkd2PM: {
    cleanTitle: 'الجميلة والوحش وقصر الورود',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '5+',
    moralLesson: 'الجمال الحقيقي هو جمال الروح والأخلاق وليس المظهر الخارجي',
  },
  TGeh3nXJtC8: {
    cleanTitle: 'الذئب والسبع خراف الصغار',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'عدم فتح الباب لأي شخص غريب والانتباه لنصائح الأم',
  },
  DSkWf5ncyBk: {
    cleanTitle: 'ليلى وذات الرداء الأحمر',
    category: 'bedtime',
    categoryNameAr: 'حواديت قبل النوم',
    ageRecommendation: '3+',
    moralLesson: 'سماع كلام الوالدين والحذر من الغرباء',
  },
  'aTiiAEQN-dI': {
    cleanTitle: 'هانسل وغريتل والبيت العجيب',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'الترابط بين الإخوة والتفكير الهادئ في الأوقات الصعبة',
  },
  AyzK9z8aKsY: {
    cleanTitle: 'رومبلستيلتسكين وحكاية القش والذهب',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '5+',
    moralLesson: 'التفكير الحكيم وعدم تقديم وعود تفوق طاقتنا',
  },
  msmxJmb3fVw: {
    cleanTitle: 'حكاية الحذاء الأحمر ودرس التواضع',
    category: 'bedtime',
    categoryNameAr: 'حواديت قبل النوم',
    ageRecommendation: '5+',
    moralLesson: 'التواضع وتقدير النعم التي نمتلكها',
  },
  '1_xNjOIRNrY': {
    cleanTitle: 'سر الأميرات الراقصات الـ 12',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '5+',
    moralLesson: 'الذكاء والصبر يحلان أصعب الألغاز',
  },
  CYhNbyoOmps: {
    cleanTitle: 'عقلة الإصبع ثامبلينا وزهرة التيوليب',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '3+',
    moralLesson: 'الصداقة ومساعدة الكائنات الضعيفة في وقت الحاجة',
  },
  'JMO2j-7uOfo': {
    cleanTitle: 'جاك ونبتة الفاصوليا السحرية',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'الشجاعة في مساعدة العائلة والابتعاد عن الطمع',
  },
  homoIxPwwg0: {
    cleanTitle: 'جولديلوكس وبيت الدببة الثلاثة',
    category: 'bedtime',
    categoryNameAr: 'حواديت قبل النوم',
    ageRecommendation: '3+',
    moralLesson: 'الاستئذان قبل دخول بيوت الآخرين أو استخدام أشيائهم',
  },
  VWanQ8ktkYM: {
    cleanTitle: 'بياض الثلج والأقزام السبعة (سنو وايت)',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'التعاون والمشاركة ونظافة البيت وحسن الجيرة',
  },
  Z9zdniPaRHQ: {
    cleanTitle: 'الأميرة النائمة وأزهار الغابة',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '5+',
    moralLesson: 'المحبة والخير يبطلان مفعول الحقد والحسد',
  },
  '79NgvahMshg': {
    cleanTitle: 'الأميرة رابونزل وسر الشعر الذهبي',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'اتباع الأحلام بصدق وشجاعة والتغلب على الخوف',
  },
  oREWJ9ZCCP4: {
    cleanTitle: 'سندريلا والحذاء الزجاجي السحري',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'المعاملة الحسنة والتواضع يرفعان شأن الإنسان',
  },
  '5zZAbSgW6t4': {
    cleanTitle: 'كوكب الحلوى الفضائي العجيب',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '3+',
    moralLesson: 'الاعتدال في تناول السكريات والاهتمام بصحة الأسنان والجسم',
  },
  '9oSzW6VgnBU': {
    cleanTitle: 'شخصيات فنانيس والفانوس العجيب',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '3+',
    moralLesson: 'إدخال البهجة والسرور على العائلة والأصدقاء',
  },
};

function cleanVideoTitle(rawTitle: string): string {
  let cleaned = rawTitle
    .replace(/حواديت قبل النوم/gi, '')
    .replace(/كرتون اطفال بالعربي/gi, '')
    .replace(/رسوم متحركة للاطفال بالعربي/gi, '')
    .replace(/رسوم متحركة للاطفال/gi, '')
    .replace(/رسوم متحركة باللغة العربية/gi, '')
    .replace(/رسوم متحركة/gi, '')
    .replace(/قصص اطفال قبل النوم/gi, '')
    .replace(/قصص للأطفال/gi, '')
    .replace(/قصص اطفال/gi, '')
    .replace(/قصة قبل النوم للأطفال/gi, '')
    .replace(/قصة ما قبل النوم للأطفال/gi, '')
    .replace(/حدوتة قبل النوم للاطفال/gi, '')
    .replace(/حدوتة قبل النوم/gi, '')
    .replace(/كرتون ورسوم متحركة للاطفال/gi, '')
    .replace(/كرتون اطفال/gi, '')
    .replace(/كرتون/gi, '')
    .replace(/حواديت أطفال قبل النوم/gi, '')
    .replace(/حواديت أطفال/gi, '')
    .replace(/حودايت قبل النوم بالعربي/gi, '')
    .replace(/cinderella/gi, '')
    .replace(/Snow White/gi, '')
    .replace(/\|/g, ' - ')
    .trim();

  cleaned = cleaned.replace(/^[\s\-–—]+|[\s\-–—]+$/g, '').trim();

  if (cleaned.includes(' - ')) {
    const parts = cleaned
      .split(' - ')
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length > 0) {
      cleaned = parts[0];
    }
  }

  return cleaned || rawTitle;
}

function deduceCategory(
  title: string
): {
  category: StoryCategory;
  categoryNameAr: string;
} {
  const lower = title.toLowerCase();

  if (
    lower.includes('أمير') ||
    lower.includes('امير') ||
    lower.includes('سندريلا') ||
    lower.includes('رابونزل') ||
    lower.includes('سنووايت') ||
    lower.includes('بياض الثلج') ||
    lower.includes('حورية البحر') ||
    lower.includes('فاسيليسا') ||
    lower.includes('الجميلة والوحش')
  ) {
    return {
      category: 'princesses',
      categoryNameAr: 'قصص الأميرات',
    };
  }

  if (
    lower.includes('حيوان') ||
    lower.includes('غابة') ||
    lower.includes('ثعلب') ||
    lower.includes('كلب') ||
    lower.includes('أسد') ||
    lower.includes('فأر') ||
    lower.includes('أرنب') ||
    lower.includes('سلحفاة') ||
    lower.includes('ذئب') ||
    lower.includes('خراف') ||
    lower.includes('دب')
  ) {
    return {
      category: 'animals',
      categoryNameAr: 'حيوانات الغابة',
    };
  }

  if (
    lower.includes('نوم') ||
    lower.includes('سرير') ||
    lower.includes('ليل') ||
    lower.includes('أخلاق') ||
    lower.includes('صدق') ||
    lower.includes('أمانة')
  ) {
    return {
      category: 'bedtime',
      categoryNameAr: 'حواديت قبل النوم',
    };
  }

  if (
    lower.includes('فضاء') ||
    lower.includes('حلوى') ||
    lower.includes('زمن') ||
    lower.includes('سحر') ||
    lower.includes('فانوس') ||
    lower.includes('عجيب') ||
    lower.includes('روبنسون')
  ) {
    return {
      category: 'fantasy',
      categoryNameAr: 'خيال وفضاء ومرح',
    };
  }

  if (
    lower.includes('سندباد') ||
    lower.includes('مغامرة') ||
    lower.includes('تنين') ||
    lower.includes('طائر ناري') ||
    lower.includes('جاك') ||
    lower.includes('بحر') ||
    lower.includes('موموتارو')
  ) {
    return {
      category: 'adventure',
      categoryNameAr: 'مغامرات وأساطير',
    };
  }

  return {
    category: 'all',
    categoryNameAr: 'كل الحكايات',
  };
}

function formatISODuration(iso: string): string {
  const match = iso.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return '15:00';

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const pad = (n: number) =>
    n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}:${pad(seconds)}`;
}

function formatViewsArabic(
  views: number | string
): string {
  if (typeof views === 'string') {
    if (
      views.includes('مشاهدة') ||
      views.includes('ألف') ||
      views.includes('مليون')
    ) {
      return views;
    }

    const parsed = parseInt(
      views.replace(/[^0-9]/g, ''),
      10
    );

    if (isNaN(parsed)) return 'جديد';

    views = parsed;
  }

  if (views >= 1000000) {
    const m = (views / 1000000)
      .toFixed(1)
      .replace('.0', '');

    return `${m} مليون`;
  }

  if (views >= 1000) {
    const k = (views / 1000)
      .toFixed(1)
      .replace('.0', '');

    return `${k} ألف`;
  }

  return `${views}`;
}

/**
 * Remove duplicate videos.
 * Only the first video is the newest featured story.
 */
function normalizeVideos(
  videos: VideoStory[],
  markNewest = true
): VideoStory[] {
  const seen = new Set<string>();

  const unique = videos.filter((video) => {
    if (!video.id || seen.has(video.id)) {
      return false;
    }

    seen.add(video.id);
    return true;
  });

  return unique.map((video, index) => ({
    ...video,
    isFeatured: index === 0,
    publishedDate:
      index === 0 && markNewest
        ? 'أحدث حلقة تم نشرها 🚀'
        : video.publishedDate === 'أحدث حلقة تم نشرها 🚀'
          ? 'حلقة سابقة'
          : video.publishedDate,
  }));
}

/**
 * Fetch every page of the channel's uploads playlist.
 * YouTube API returns at most 50 videos per page.
 */
async function fetchViaYouTubeDataApi(
  apiKey: string
): Promise<VideoStory[] | null> {
  try {
    const playlistItems: any[] = [];

    let nextPageToken: string | undefined;

    const seenTokens = new Set<string>();

    do {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails',
        playlistId: OFFICIAL_UPLOADS_PLAYLIST_ID,
        maxResults: '50',
        key: apiKey,
      });

      if (nextPageToken) {
        params.set('pageToken', nextPageToken);
      }

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?${params}`,
        {
          signal: AbortSignal.timeout(12000),
        }
      );

      if (!res.ok) {
        console.warn(
          `[YouTube API] playlistItems HTTP ${res.status}`
        );

        return null;
      }

      const data = (await res.json()) as {
        items?: any[];
        nextPageToken?: string;
      };

      playlistItems.push(...(data.items || []));

      nextPageToken = data.nextPageToken;

      if (nextPageToken) {
        if (seenTokens.has(nextPageToken)) {
          break;
        }

        seenTokens.add(nextPageToken);
      }
    } while (nextPageToken);

    const videoIds = [
      ...new Set<string>(
        playlistItems
          .map(
            (item) =>
              item.contentDetails?.videoId ||
              item.snippet?.resourceId?.videoId
          )
          .filter(
            (id): id is string =>
              typeof id === 'string' &&
              /^[A-Za-z0-9_-]{11}$/.test(id)
          )
      ),
    ];

    if (videoIds.length === 0) {
      return null;
    }

    const videoDetailsMap = new Map<string, any>();

    // Fetch details in batches of 50.
    for (
      let offset = 0;
      offset < videoIds.length;
      offset += 50
    ) {
      const ids = videoIds.slice(offset, offset + 50);

      const params = new URLSearchParams({
        part: 'snippet,contentDetails,statistics,status',
        id: ids.join(','),
        key: apiKey,
      });

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${params}`,
        {
          signal: AbortSignal.timeout(12000),
        }
      );

      if (!res.ok) {
        console.warn(
          `[YouTube API] videos HTTP ${res.status}`
        );

        return null;
      }

      const data = (await res.json()) as {
        items?: any[];
      };

      for (const video of data.items || []) {
        if (video.id) {
          videoDetailsMap.set(video.id, video);
        }
      }
    }

    const result: VideoStory[] = [];

    // Preserve uploads-playlist order: newest first.
    for (const vidId of videoIds) {
      const detail = videoDetailsMap.get(vidId);

      if (!detail) continue;

      const status = detail.status || {};

      if (
        status.privacyStatus !== 'public' ||
        status.embeddable === false
      ) {
        continue;
      }

      if (
        detail.snippet?.channelId &&
        detail.snippet.channelId !== OFFICIAL_CHANNEL_ID
      ) {
        continue;
      }

      const snippet = detail.snippet || {};

      const description: string =
        snippet.description || '';

      const rawTitle: string =
        snippet.title || 'حلقة جديدة من قصة العائلة';

      const publishedAt: string =
        snippet.publishedAt || '';

      const curated = CURATED_METADATA[vidId] || {};

      const deduced = deduceCategory(rawTitle);

      result.push({
        id: vidId,
        title: rawTitle,
        cleanTitle:
          curated.cleanTitle ||
          cleanVideoTitle(rawTitle),

        description:
          curated.description ||
          description.slice(0, 180) +
            (description.length > 180 ? '...' : ''),

        category:
          curated.category ||
          deduced.category,

        categoryNameAr:
          curated.categoryNameAr ||
          deduced.categoryNameAr,

        duration:
          curated.duration ||
          formatISODuration(
            detail.contentDetails?.duration || ''
          ),

        viewsApprox: formatViewsArabic(
          detail.statistics?.viewCount || '0'
        ),

        isFeatured: false,

        ageRecommendation:
          curated.ageRecommendation || '3+',

        moralLesson:
          curated.moralLesson ||
          'القيم النبيلة والتعاون وحسن الأخلاق في عالم الحكايات',

        publishedDate: publishedAt
          ? new Date(publishedAt).toLocaleDateString(
              'ar-EG'
            )
          : 'حلقة من قصة العائلة',
      });
    }

    if (result.length === 0) {
      return null;
    }

    return normalizeVideos(result, true);
  } catch (error) {
    console.warn(
      '[YouTube API] Error fetching videos:',
      error
    );

    return null;
  }
}

/**
 * Backup method:
 * Read videos from the official YouTube channel page.
 */
async function fetchViaChannelScraper(): Promise<
  VideoStory[] | null
> {
  try {
    const url =
      `https://www.youtube.com/channel/${OFFICIAL_CHANNEL_ID}/videos`;

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      console.warn(
        `[Channel Scraper] HTTP ${res.status}`
      );

      return null;
    }

    const html = await res.text();

    const match =
      html.match(
        /var ytInitialData = ({.*?});<\/script>/s
      ) ||
      html.match(
        /ytInitialData\s*=\s*({.+?});/
      );

    if (!match) {
      console.warn(
        '[Channel Scraper] ytInitialData not found'
      );

      return null;
    }

    const data = JSON.parse(match[1]);

    const tabs =
      data?.contents
        ?.twoColumnBrowseResultsRenderer
        ?.tabs || [];

    const videosTab =
      tabs.find(
        (t: any) =>
          t?.tabRenderer?.title === 'الفيديوهات' ||
          t?.tabRenderer?.title === 'Videos' ||
          t?.tabRenderer?.selected === true
      ) ||
      tabs[1] ||
      tabs[0];

    const contents =
      videosTab?.tabRenderer?.content
        ?.richGridRenderer?.contents ||
      videosTab?.tabRenderer?.content
        ?.sectionListRenderer?.contents ||
      [];

    const stories: VideoStory[] = [];

    for (
      let index = 0;
      index < contents.length;
      index++
    ) {
      const item = contents[index];

      const lvm =
        item?.richItemRenderer?.content
          ?.lockupViewModel;

      const vr =
        item?.richItemRenderer?.content
          ?.videoRenderer;

      let videoId = '';
      let rawTitle = '';
      let viewsText = 'جديد';
      let publishedText = '';
      let durationText = '15:00';

      if (lvm) {
        videoId = lvm.contentId || '';

        rawTitle =
          lvm.metadata
            ?.lockupMetadataViewModel
            ?.title?.content || '';

        const rows =
          lvm.metadata
            ?.lockupMetadataViewModel
            ?.metadata
            ?.contentMetadataViewModel
            ?.metadataRows || [];

        const parts = rows
          .flatMap((r: any) =>
            r.metadataParts?.map(
              (p: any) => p.text?.content
            ) || []
          )
          .filter(Boolean);

        if (parts.length > 0) {
          viewsText = parts[0] || 'جديد';
        }

        if (parts.length > 1) {
          publishedText = parts[1] || '';
        }
      } else if (vr) {
        videoId = vr.videoId || '';

        rawTitle =
          vr.title?.runs?.[0]?.text || '';

        viewsText =
          vr.viewCountText?.simpleText || 'جديد';

        publishedText =
          vr.publishedTimeText?.simpleText || '';

        durationText =
          vr.lengthText?.simpleText || '15:00';
      }

      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        continue;
      }

      const curated =
        CURATED_METADATA[videoId] || {};

      const fallbackInitial =
        INITIAL_VIDEOS.find(
          (v) => v.id === videoId
        );

      const deduced =
        deduceCategory(rawTitle);

      stories.push({
        id: videoId,
        title:
          rawTitle ||
          fallbackInitial?.title ||
          'حكاية من قصة العائلة',

        cleanTitle:
          curated.cleanTitle ||
          fallbackInitial?.cleanTitle ||
          cleanVideoTitle(rawTitle),

        description:
          curated.description ||
          fallbackInitial?.description ||
          `حكاية كرتونية ممتعة للأطفال من قناة قصة العائلة بعنوان: ${cleanVideoTitle(rawTitle)}.`,

        category:
          curated.category ||
          fallbackInitial?.category ||
          deduced.category,

        categoryNameAr:
          curated.categoryNameAr ||
          fallbackInitial?.categoryNameAr ||
          deduced.categoryNameAr,

        duration:
          curated.duration ||
          fallbackInitial?.duration ||
          durationText,

        viewsApprox:
          formatViewsArabic(viewsText),

        isFeatured: false,

        ageRecommendation:
          curated.ageRecommendation ||
          fallbackInitial?.ageRecommendation ||
          '3+',

        moralLesson:
          curated.moralLesson ||
          fallbackInitial?.moralLesson ||
          'القيم الأخلاقية وحب الأصدقاء والتعاون الصادق',

        publishedDate:
          publishedText || 'حلقة جديدة',
      });
    }

    if (stories.length > 0) {
      // Keep older saved stories when using
      // the channel-page backup method.
      const seen = new Set(
        stories.map((s) => s.id)
      );

      for (const initial of INITIAL_VIDEOS) {
        if (!seen.has(initial.id)) {
          seen.add(initial.id);
          stories.push(initial);
        }
      }

      return normalizeVideos(stories, true);
    }

    return null;
  } catch (error) {
    console.warn(
      '[Channel Scraper] Error:',
      error
    );

    return null;
  }
}

/**
 * Main method used by /api/videos and /api/refresh.
 */
export async function getChannelVideos(
  forceRefresh = false
): Promise<{
  videos: VideoStory[];
  source: 'api' | 'scraper' | 'fallback';
  lastSynced: string;
  isCached: boolean;
  channelId: string;
}> {
  const now = Date.now();

  // Manual refresh cooldown.
  if (
    forceRefresh &&
    now - lastManualRefreshTime <
      REFRESH_COOLDOWN_MS &&
    memoryCache
  ) {
    return {
      videos: memoryCache.videos,
      source: memoryCache.source,
      lastSynced: new Date(
        memoryCache.timestamp
      ).toISOString(),
      isCached: true,
      channelId: OFFICIAL_CHANNEL_ID,
    };
  }

  // Use valid cache on normal requests.
  if (
    !forceRefresh &&
    memoryCache &&
    now - memoryCache.timestamp <
      (memoryCache.source === 'fallback'
        ? 60_000
        : CACHE_TTL_MS)
  ) {
    return {
      videos: memoryCache.videos,
      source: memoryCache.source,
      lastSynced: new Date(
        memoryCache.timestamp
      ).toISOString(),
      isCached: true,
      channelId: OFFICIAL_CHANNEL_ID,
    };
  }

  if (forceRefresh) {
    lastManualRefreshTime = now;
  }

  // Primary source: Official YouTube API.
  const apiKey =
    process.env.YOUTUBE_API_KEY?.trim();

  if (apiKey) {
    const apiVideos =
      await fetchViaYouTubeDataApi(apiKey);

    if (apiVideos && apiVideos.length > 0) {
      const syncedAt = Date.now();

      memoryCache = {
        videos: apiVideos,
        timestamp: syncedAt,
        source: 'api',
      };

      return {
        videos: apiVideos,
        source: 'api',
        lastSynced:
          new Date(syncedAt).toISOString(),
        isCached: false,
        channelId: OFFICIAL_CHANNEL_ID,
      };
    }
  }

  // Backup source: YouTube channel page.
  const scrapedVideos =
    await fetchViaChannelScraper();

  if (
    scrapedVideos &&
    scrapedVideos.length > 0
  ) {
    const syncedAt = Date.now();

    memoryCache = {
      videos: scrapedVideos,
      timestamp: syncedAt,
      source: 'scraper',
    };

    return {
      videos: scrapedVideos,
      source: 'scraper',
      lastSynced:
        new Date(syncedAt).toISOString(),
      isCached: false,
      channelId: OFFICIAL_CHANNEL_ID,
    };
  }

  // Keep last successfully loaded videos
  // when YouTube is temporarily unavailable.
  if (memoryCache) {
    return {
      videos: memoryCache.videos,
      source: memoryCache.source,
      lastSynced: new Date(
        memoryCache.timestamp
      ).toISOString(),
      isCached: true,
      channelId: OFFICIAL_CHANNEL_ID,
    };
  }

  // Final offline fallback.
  // Do not hard-code any old episode as newest.
  const fallbackVideos =
    normalizeVideos(
      [...INITIAL_VIDEOS],
      false
    );

  const fallbackTime = Date.now();

  memoryCache = {
    videos: fallbackVideos,
    timestamp: fallbackTime,
    source: 'fallback',
  };

  return {
    videos: fallbackVideos,
    source: 'fallback',
    lastSynced:
      new Date(fallbackTime).toISOString(),
    isCached: false,
    channelId: OFFICIAL_CHANNEL_ID,
  };
}

/**
 * Find a video from the channel's list.
 */
export async function getVideoById(
  videoId: string
): Promise<VideoStory | null> {
  const { videos } =
    await getChannelVideos(false);

  return (
    videos.find(
      (video) => video.id === videoId
    ) || null
  );
}
