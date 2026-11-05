import { VideoStory, StoryCategory } from '../types';
import { INITIAL_VIDEOS } from '../data/videos';

try {
  process.loadEnvFile?.();
} catch {}

export const OFFICIAL_CHANNEL_HANDLE = '@Qessa-family';
export const OFFICIAL_CHANNEL_ID = 'UChe5CsFfnSS0b6pWN1x3q0w';
export const OFFICIAL_UPLOADS_PLAYLIST_ID = 'UUhe5CsFfnSS0b6pWN1x3q0w';

interface CacheEntry {
  videos: VideoStory[];
  timestamp: number;
  source: 'api' | 'scraper' | 'fallback';
}

// In-memory cache for serverless / express runtime
let memoryCache: CacheEntry | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
let lastManualRefreshTime = 0;
const REFRESH_COOLDOWN_MS = 25 * 1000; // 25 seconds anti-spam cooldown

/**
 * Curated metadata dictionary for channel videos to ensure rich child-friendly titles,
 * moral lessons, age recommendations, and accurate categories.
 */
const CURATED_METADATA: Record<string, Partial<VideoStory>> = {
  opSJHrJX3mc: {
    cleanTitle: 'الثعلب مكرون وكذبة التفاحة الذهبية',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'الصدق والأمانة يجلبان محبة الأصدقاء، والكذب يوقع صاحبه في المتاعب',
    isFeatured: true,
  },
  S5h4O4sRkNA: {
    cleanTitle: 'قصة الكلب بولت والقوى الخارقة',
    category: 'animals',
    categoryNameAr: 'حيوانات الغابة',
    ageRecommendation: '3+',
    moralLesson: 'الشجاعة والوفاء للأصدقاء أعظم من أي قوة خارقة',
    isFeatured: true,
  },
  zKilkVjn7Ac: {
    cleanTitle: 'عائلة روبنسون والسفر عبر الزمن',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '5+',
    moralLesson: 'الاستمرار في المحاولة وعدم الاستسلام أمام الفشل',
    isFeatured: true,
  },
  QIRsBZCPd9A: {
    cleanTitle: 'رايا وآخر تنين الأسطوري',
    category: 'adventure',
    categoryNameAr: 'مغامرات وأساطير',
    ageRecommendation: '5+',
    moralLesson: 'الثقة بالآخرين والتسامح هما سر السلام والمحبة',
    isFeatured: true,
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
    isFeatured: true,
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
    isFeatured: true,
  },
  '6tcXaaGfyPU': {
    cleanTitle: 'حورية البحر الصغيرة أريال',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'أهمية الحوار مع الوالدين واحترام التنوع بين العوالم',
    isFeatured: true,
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
    isFeatured: true,
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
    isFeatured: true,
  },
  oREWJ9ZCCP4: {
    cleanTitle: 'سندريلا والحذاء الزجاجي السحري',
    category: 'princesses',
    categoryNameAr: 'قصص الأميرات',
    ageRecommendation: '3+',
    moralLesson: 'المعاملة الحسنة والتواضع يرفعان شأن الإنسان',
    isFeatured: true,
  },
  '5zZAbSgW6t4': {
    cleanTitle: 'كوكب الحلوى الفضائي العجيب',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '3+',
    moralLesson: 'الاعتدال في تناول السكريات والاهتمام بصحة الأسنان والجسم',
    isFeatured: true,
  },
  '9oSzW6VgnBU': {
    cleanTitle: 'شخصيات فنانيس والفانوس العجيب',
    category: 'fantasy',
    categoryNameAr: 'خيال وفضاء ومرح',
    ageRecommendation: '3+',
    moralLesson: 'إدخال البهجة والسرور على العائلة والأصدقاء',
  },
};

/**
 * Clean raw YouTube title to kid-friendly short title
 */
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

  // Remove leading/trailing dashes and spaces
  cleaned = cleaned.replace(/^[\s\-–—]+|[\s\-–—]+$/g, '').trim();

  // If title was split into segments, pick the most descriptive primary segment
  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ').map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      cleaned = parts[0];
    }
  }

  return cleaned || rawTitle;
}

/**
 * Categorize video based on keywords if not manually curated
 */
function deduceCategory(title: string): { category: StoryCategory; categoryNameAr: string } {
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
    return { category: 'princesses', categoryNameAr: 'قصص الأميرات' };
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
    return { category: 'animals', categoryNameAr: 'حيوانات الغابة' };
  }
  if (
    lower.includes('نوم') ||
    lower.includes('سرير') ||
    lower.includes('ليل') ||
    lower.includes('أخلاق') ||
    lower.includes('صدق') ||
    lower.includes('أمانة')
  ) {
    return { category: 'bedtime', categoryNameAr: 'حواديت قبل النوم' };
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
    return { category: 'fantasy', categoryNameAr: 'خيال وفضاء ومرح' };
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
    return { category: 'adventure', categoryNameAr: 'مغامرات وأساطير' };
  }
  return { category: 'all', categoryNameAr: 'كل الحكايات' };
}

/**
 * Format ISO 8601 duration (e.g. PT14M20S -> 14:20)
 */
function formatISODuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '15:00';
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);

  const pad = (n: number) => n.toString().padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

/**
 * Format view count in friendly Arabic
 */
function formatViewsArabic(views: number | string): string {
  if (typeof views === 'string') {
    if (views.includes('مشاهدة') || views.includes('ألف') || views.includes('مليون')) return views;
    const parsed = parseInt(views.replace(/[^0-9]/g, ''), 10);
    if (isNaN(parsed)) return 'جديد';
    views = parsed;
  }
  if (views >= 1000000) {
    const m = (views / 1000000).toFixed(1).replace('.0', '');
    return `${m} مليون`;
  }
  if (views >= 1000) {
    const k = (views / 1000).toFixed(1).replace('.0', '');
    return `${k} ألف`;
  }
  return `${views}`;
}

/**
 * Fetch channel videos via official YouTube Data API v3
 */
async function fetchViaYouTubeDataApi(apiKey: string): Promise<VideoStory[] | null> {
  try {
    // 1. Get uploads playlist ID for the channel
    const playlistId = OFFICIAL_UPLOADS_PLAYLIST_ID;

    // 2. Fetch playlist items (up to 50 items)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${apiKey}`;
    const res = await fetch(playlistUrl);
    if (!res.ok) {
      console.warn(`[YouTube API] Playlist items error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    const items = data.items || [];
    if (items.length === 0) return null;

    const videoIds = items
      .map((item: any) => item.contentDetails?.videoId)
      .filter((id: any): id is string => Boolean(id));

    // 3. Batch fetch video details (snippet, contentDetails, statistics, status)
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,status&id=${videoIds.join(',')}&key=${apiKey}`;
    const detRes = await fetch(detailsUrl);
    if (!detRes.ok) {
      console.warn(`[YouTube API] Video details error: ${detRes.status}`);
      return null;
    }
    const detData = await detRes.json();
    const videoDetailsMap = new Map<string, any>();
    for (const v of detData.items || []) {
      videoDetailsMap.set(v.id, v);
    }

    const result: VideoStory[] = [];

    for (let index = 0; index < videoIds.length; index++) {
      const vidId = videoIds[index];
      const detail = videoDetailsMap.get(vidId);
      if (!detail) continue;

      // Filter out private or non-embeddable videos
      const status = detail.status || {};
      if (status.privacyStatus === 'private' || status.embeddable === false) {
        continue;
      }

      const snippet = detail.snippet || {};
      const stats = detail.statistics || {};
      const contentDetails = detail.contentDetails || {};

      const rawTitle = snippet.title || 'حلقة جديدة من قصة العائلة';
      const description = snippet.description || '';
      const publishedAt = snippet.publishedAt || '';
      const viewCount = stats.viewCount ? formatViewsArabic(stats.viewCount) : 'جديد';
      const duration = contentDetails.duration ? formatISODuration(contentDetails.duration) : '15:00';

      const curated = CURATED_METADATA[vidId] || {};
      const deduced = deduceCategory(rawTitle);

      result.push({
        id: vidId,
        title: rawTitle,
        cleanTitle: curated.cleanTitle || cleanVideoTitle(rawTitle),
        description: curated.description || description.slice(0, 180) + (description.length > 180 ? '...' : ''),
        category: curated.category || deduced.category,
        categoryNameAr: curated.categoryNameAr || deduced.categoryNameAr,
        duration: curated.duration || duration,
        viewsApprox: viewCount,
        isFeatured: index === 0 ? true : Boolean(curated.isFeatured),
        ageRecommendation: curated.ageRecommendation || '3+',
        moralLesson: curated.moralLesson || 'القيم النبيلة والتعاون وحسن الأخلاق في عالم الحكايات',
        publishedDate: index === 0 ? 'أحدث حلقة تم نشرها 🚀' : publishedAt ? new Date(publishedAt).toLocaleDateString('ar-EG') : 'حلقة مميزة',
      });
    }

    return result.length > 0 ? result : null;
  } catch (err) {
    console.warn('[YouTube API] Error fetching with Data API:', err);
    return null;
  }
}

/**
 * Resilient server-side YouTube Channel Page Parser
 * Reads the official YouTube Channel Page HTML and extracts ytInitialData.
 * This guarantees that new uploads (e.g. opSJHrJX3mc) are immediately found
 * without CORS proxies or client-side restrictions.
 */
async function fetchViaChannelScraper(): Promise<VideoStory[] | null> {
  try {
    const url = `https://www.youtube.com/${OFFICIAL_CHANNEL_HANDLE}/videos`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ar,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!res.ok) {
      console.warn(`[Channel Scraper] Failed to fetch channel page: ${res.status}`);
      return null;
    }

    const html = await res.text();
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/);
    if (!match) {
      console.warn('[Channel Scraper] ytInitialData not found in HTML');
      return null;
    }

    const data = JSON.parse(match[1]);
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
    const videosTab = tabs.find(
      (t: any) =>
        t?.tabRenderer?.title === 'الفيديوهات' ||
        t?.tabRenderer?.title === 'Videos' ||
        t?.tabRenderer?.selected === true
    ) || tabs[1] || tabs[0];

    const contents =
      videosTab?.tabRenderer?.content?.richGridRenderer?.contents ||
      videosTab?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    const stories: VideoStory[] = [];

    for (let index = 0; index < contents.length; index++) {
      const item = contents[index];
      const lvm = item?.richItemRenderer?.content?.lockupViewModel;
      const vr = item?.richItemRenderer?.content?.videoRenderer;

      let videoId = '';
      let rawTitle = '';
      let viewsText = 'جديد';
      let publishedText = '';
      let durationText = '15:00';

      if (lvm) {
        videoId = lvm.contentId || '';
        rawTitle = lvm.metadata?.lockupMetadataViewModel?.title?.content || '';
        const rows = lvm.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
        const parts = rows.flatMap((r: any) => r.metadataParts?.map((p: any) => p.text?.content)).filter(Boolean);
        if (parts.length > 0) {
          viewsText = parts[0] || 'جديد';
        }
        if (parts.length > 1) {
          publishedText = parts[1] || '';
        }
      } else if (vr) {
        videoId = vr.videoId || '';
        rawTitle = vr.title?.runs?.[0]?.text || '';
        viewsText = vr.viewCountText?.simpleText || 'جديد';
        publishedText = vr.publishedTimeText?.simpleText || '';
        durationText = vr.lengthText?.simpleText || '15:00';
      }

      if (!videoId) continue;

      const curated = CURATED_METADATA[videoId] || {};
      const fallbackInitial = INITIAL_VIDEOS.find((v) => v.id === videoId);
      const deduced = deduceCategory(rawTitle);

      stories.push({
        id: videoId,
        title: rawTitle,
        cleanTitle: curated.cleanTitle || fallbackInitial?.cleanTitle || cleanVideoTitle(rawTitle),
        description:
          curated.description ||
          fallbackInitial?.description ||
          `حكاية كرتونية ممتعة للأطفال من قناة قصة العائلة بعنوان: ${cleanVideoTitle(rawTitle)}.`,
        category: curated.category || fallbackInitial?.category || deduced.category,
        categoryNameAr: curated.categoryNameAr || fallbackInitial?.categoryNameAr || deduced.categoryNameAr,
        duration: curated.duration || fallbackInitial?.duration || durationText,
        viewsApprox: formatViewsArabic(viewsText),
        isFeatured: index === 0 ? true : Boolean(curated.isFeatured || fallbackInitial?.isFeatured),
        ageRecommendation: curated.ageRecommendation || fallbackInitial?.ageRecommendation || '3+',
        moralLesson:
          curated.moralLesson ||
          fallbackInitial?.moralLesson ||
          'القيم الأخلاقية وحب الأصدقاء والتعاون الصادق',
        publishedDate: index === 0 ? 'أحدث حلقة تم نشرها 🚀' : publishedText || 'حلقة جديدة',
      });
    }

    if (stories.length > 0) {
      // Merge any INITIAL_VIDEOS that might be further down or older so none are lost
      const seen = new Set(stories.map((s) => s.id));
      for (const initial of INITIAL_VIDEOS) {
        if (!seen.has(initial.id)) {
          seen.add(initial.id);
          stories.push(initial);
        }
      }
      return stories;
    }

    return null;
  } catch (err) {
    console.warn('[Channel Scraper] Error scraping channel page:', err);
    return null;
  }
}

/**
 * Main service method to retrieve channel stories.
 * Checks cache, runs YouTube Data API v3 (if key provided),
 * falls back to server-side channel scraper, and finally to INITIAL_VIDEOS.
 */
export async function getChannelVideos(forceRefresh = false): Promise<{
  videos: VideoStory[];
  source: 'api' | 'scraper' | 'fallback';
  lastSynced: string;
  isCached: boolean;
  channelId: string;
}> {
  const now = Date.now();

  // If forceRefresh requested, respect cooldown
  if (forceRefresh && now - lastManualRefreshTime < REFRESH_COOLDOWN_MS) {
    if (memoryCache) {
      return {
        videos: memoryCache.videos,
        source: memoryCache.source,
        lastSynced: new Date(memoryCache.timestamp).toISOString(),
        isCached: true,
        channelId: OFFICIAL_CHANNEL_ID,
      };
    }
  }

  // Return cache if valid and not forceRefresh
  if (!forceRefresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return {
      videos: memoryCache.videos,
      source: memoryCache.source,
      lastSynced: new Date(memoryCache.timestamp).toISOString(),
      isCached: true,
      channelId: OFFICIAL_CHANNEL_ID,
    };
  }

  if (forceRefresh) {
    lastManualRefreshTime = now;
  }

  // 1. Try YouTube Data API v3 if key available
  try {
    process.loadEnvFile?.();
  } catch {}
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    const apiVideos = await fetchViaYouTubeDataApi(apiKey);
    if (apiVideos && apiVideos.length > 0) {
      memoryCache = {
        videos: apiVideos,
        timestamp: now,
        source: 'api',
      };
      return {
        videos: apiVideos,
        source: 'api',
        lastSynced: new Date(now).toISOString(),
        isCached: false,
        channelId: OFFICIAL_CHANNEL_ID,
      };
    }
  }

  // 2. Try Server-Side Channel Scraper (Live and extracts opSJHrJX3mc directly)
  const scrapedVideos = await fetchViaChannelScraper();
  if (scrapedVideos && scrapedVideos.length > 0) {
    memoryCache = {
      videos: scrapedVideos,
      timestamp: now,
      source: 'scraper',
    };
    return {
      videos: scrapedVideos,
      source: 'scraper',
      lastSynced: new Date(now).toISOString(),
      isCached: false,
      channelId: OFFICIAL_CHANNEL_ID,
    };
  }

  // 3. Fallback to INITIAL_VIDEOS
  // Ensure the newest episode opSJHrJX3mc is prepended if not in INITIAL_VIDEOS
  let fallbackList = [...INITIAL_VIDEOS];
  if (!fallbackList.some((v) => v.id === 'opSJHrJX3mc')) {
    const newest: VideoStory = {
      id: 'opSJHrJX3mc',
      title: 'الثعلب مكرون وكذبة التفاحة | قصص أطفال عن الصدق والأمانة | حواديت حيوانات الغابة',
      cleanTitle: 'الثعلب مكرون وكذبة التفاحة الذهبية',
      description: 'حكاية شيقة للأطفال عن الثعلب مكرون الذي تعلم درساً مهماً في الصدق والأمانة وكيف أن قول الحقيقة ينجي دائماً.',
      category: 'animals',
      categoryNameAr: 'حيوانات الغابة',
      duration: '14:30',
      viewsApprox: 'جديد',
      isFeatured: true,
      ageRecommendation: '3+',
      moralLesson: 'الصدق والأمانة يجلبان محبة الأصدقاء، والكذب يوقع صاحبه في المتاعب',
      publishedDate: 'أحدث حلقة تم نشرها 🚀',
    };
    fallbackList = [newest, ...fallbackList];
  }

  memoryCache = {
    videos: fallbackList,
    timestamp: now,
    source: 'fallback',
  };

  return {
    videos: fallbackList,
    source: 'fallback',
    lastSynced: new Date(now).toISOString(),
    isCached: false,
    channelId: OFFICIAL_CHANNEL_ID,
  };
}

/**
 * Get single video by ID
 */
export async function getVideoById(videoId: string): Promise<VideoStory | null> {
  const { videos } = await getChannelVideos(false);
  const found = videos.find((v) => v.id === videoId);
  if (found) return found;

  // Try oEmbed lookup as a fallback
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      const rawTitle = data.title || 'قصة من قصة العائلة';
      const curated = CURATED_METADATA[videoId] || {};
      const deduced = deduceCategory(rawTitle);
      return {
        id: videoId,
        title: rawTitle,
        cleanTitle: curated.cleanTitle || cleanVideoTitle(rawTitle),
        description: curated.description || 'حلقة كرتونية ممتعة للأطفال من قناة قصة العائلة.',
        category: curated.category || deduced.category,
        categoryNameAr: curated.categoryNameAr || deduced.categoryNameAr,
        duration: '15:00',
        viewsApprox: 'جديد',
        ageRecommendation: curated.ageRecommendation || '3+',
        moralLesson: curated.moralLesson || 'القيم النبيلة والتعاون وحسن الأخلاق',
        publishedDate: 'حلقة خاصة',
      };
    }
  } catch {}

  return null;
}
