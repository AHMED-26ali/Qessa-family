import { storyNotes } from '../data/storyNotes.js';
import { excerpt } from '../utils/text.js';
import { matchesSearchQuery } from '../utils/search.js';
import { OFFICIAL_CHANNEL_URL } from '../data/videos.js';
import {
  CATEGORIES, INFORMATION_PAGES, SITE_URL, STORY_LIBRARY_PATH, categoryPath, isPublicCategory, playerUrl, storyPath, thumbnailUrl,
  type PublicCategory,
} from '../site.js';
import type { VideoStory } from '../types.js';

const FACEBOOK_URL = 'https://www.facebook.com/2essafamily';

export function escapeMarkup(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export function storyTitle(video: VideoStory) {
  return storyNotes[video.id]?.title || video.cleanTitle.replace(/\s*#[\p{L}\p{N}_]+/gu, '').trim() || video.title;
}

export function storyDescription(video: VideoStory) {
  const notes = storyNotes[video.id];
  if (notes) return notes.summary;
  const original = video.storyText
    ?.split(/\r?\n/)
    .map((line) => line.replace(/\*{1,2}|\s*#[\p{L}\p{N}_]+/gu, '').trim())
    .filter((line) => /[\p{Script=Arabic}]/u.test(line) && !line.startsWith('#') && !line.includes('://'))
    .slice(0, 3)
    .join('\n\n');
  return (original && excerpt(original, 850)) || video.description.trim() ||
    `شاهد حكاية ${storyTitle(video)} بالعربي على موقع قصة العائلة.`;
}

const navigation = Object.entries(CATEGORIES)
  .map(([id, category]) => `<a href="${categoryPath(id as PublicCategory)}">${category.title}</a>`)
  .join('');

export function renderPage({
  title, description, pathname, body, image = SITE_URL + '/brand-logo.webp', data, noindex = false, videoUrl,
}: {
  title: string;
  description: string;
  pathname: string;
  body: string;
  image?: string;
  data?: object;
  noindex?: boolean;
  videoUrl?: string;
}) {
  const url = SITE_URL + pathname;
  const safeTitle = escapeMarkup(title + ' | قصة العائلة');
  const safeDescription = escapeMarkup(excerpt(description.replace(/\s+/g, ' '), 185));
  const secondaryNavigation = Object.entries(INFORMATION_PAGES)
    .map(([link, label]) => `<a href="${link}">${label}</a>`).join('');
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="google-adsense-account" content="ca-pub-7000140651360496">
<script>(window.adsbygoogle = window.adsbygoogle || []).pauseAdRequests = 1;</script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7000140651360496" crossorigin="anonymous"></script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-video-preview:-1'}">
<link rel="canonical" href="${escapeMarkup(url)}">
<link rel="icon" href="/brand-logo.webp" type="image/webp">
<link rel="stylesheet" href="/content-pages.css">
<meta property="og:site_name" content="قصة العائلة">
<meta property="og:locale" content="ar_AR">
<meta property="og:type" content="${videoUrl ? 'video.other' : 'website'}">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeDescription}">
<meta property="og:url" content="${escapeMarkup(url)}">
<meta property="og:image" content="${escapeMarkup(image)}">
${videoUrl ? `<meta property="og:video" content="${escapeMarkup(videoUrl)}">` : ''}
${data ? `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>` : ''}
</head>
<body>
<a class="skip" href="#content">انتقل إلى المحتوى</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/"><img src="/brand-logo.webp" width="52" height="52" alt="">قصة العائلة</a>
    <nav aria-label="الموقع"><a href="${STORY_LIBRARY_PATH}">مكتبة الحواديت</a><a href="/#games-world">الألعاب</a></nav>
  </div>
</header>
<main class="wrap" id="content">${body}</main>
<footer class="site-footer">
  <div class="wrap">
    <nav aria-label="تصنيفات الحواديت">${navigation}</nav>
    <nav aria-label="معلومات الموقع">${secondaryNavigation}</nav>
    <p>قصة العائلة © ${new Date().getFullYear()}</p>
  </div>
</footer>
</body>
</html>`;
}

function storyList(videos: VideoStory[]) {
  return `<ul class="story-grid">${videos.map((video) => `<li>
    <a href="${storyPath(video.id)}">
      <img src="${thumbnailUrl(video.id)}" width="480" height="360" loading="lazy" decoding="async" alt="">
      <span>${escapeMarkup(storyTitle(video))}</span>
    </a>
  </li>`).join('')}</ul>`;
}

export function renderStory(video: VideoStory, videos: VideoStory[]) {
  const title = storyTitle(video);
  const description = storyDescription(video);
  const pathname = storyPath(video.id);
  const image = thumbnailUrl(video.id);
  const embed = playerUrl(video.id);
  const notes = storyNotes[video.id];
  const fullStory = notes?.fullVideoId ? videos.find((item) => item.id === notes.fullVideoId) : undefined;
  const related = videos.filter((item) => item.id !== video.id && item.id !== fullStory?.id &&
    item.category === video.category).slice(0, 3);

  const data = video.uploadDate ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description,
    thumbnailUrl: [image],
    uploadDate: video.uploadDate,
    ...(video.isoDuration ? { duration: video.isoDuration } : {}),
    embedUrl: embed,
    url: SITE_URL + pathname,
    inLanguage: 'ar',
  } : undefined;

  return renderPage({
    title, description, pathname, image, data, videoUrl: embed,
    body: `<article>
    <nav class="breadcrumbs" aria-label="مسار الصفحة">
      <a href="${STORY_LIBRARY_PATH}">الحواديت</a>
      ${isPublicCategory(video.category)
        ? `<a href="${categoryPath(video.category)}">${CATEGORIES[video.category].title}</a>`
        : ''}
    </nav>
    <h1>${escapeMarkup(title)}</h1>
    ${video.isoDuration ? `<p class="duration">مدة الفيديو <time datetime="${escapeMarkup(video.isoDuration)}" dir="ltr">${escapeMarkup(video.duration)}</time></p>` : ''}
    <div class="player">
      <iframe width="960" height="540" src="${escapeMarkup(embed)}" title="${escapeMarkup(title)}"
        allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
    </div>
    <details class="player-help">
      <summary>الفيديو ما اشتغلش؟</summary>
      <p><a href="${pathname}">حمّل صفحة الحكاية من جديد</a> واضغط تشغيل داخل المشغّل. تقدر تقرأ عن الحكاية تحت لو التحميل اتأخر.</p>
    </details>
    <section class="panel">
      <h2>عن الحدوتة</h2>
      <p class="summary">${escapeMarkup(description)}</p>
      ${notes?.question ? `<p><strong>سؤال بعد الحكاية</strong><br>${escapeMarkup(notes.question)}</p>` : ''}
      ${fullStory ? `<p><a class="action" href="${storyPath(fullStory.id)}">شاهد الحكاية الكاملة</a></p>` : ''}
    </section>
  </article>
  ${related.length ? `<section><h2>حواديت تانية ممكن تعجبكم</h2>${storyList(related)}</section>` : ''}`,
  });
}

export function renderLibrary(videos: VideoStory[], query: string) {
  const title = 'مكتبة حواديت الأطفال بالعربي';
  const description = 'دوروا على حدوتة بالاسم، أو اختاروا من قصص الأميرات والحيوانات وحواديت قبل النوم. فيديوهات عربية للأطفال من قناة قصة العائلة.';
  const matchingVideos = query ? videos.filter((video) => matchesSearchQuery([
    storyTitle(video), video.title, video.description, video.categoryNameAr,
  ], query)) : videos;
  const safeQuery = escapeMarkup(query);

  return renderPage({
    title, description, pathname: STORY_LIBRARY_PATH, noindex: !!query,
    body: `<h1>${title}</h1><p class="intro">${description}</p>
    <form role="search" action="${STORY_LIBRARY_PATH}" method="get" class="library-search">
      <label for="story-query">ابحث باسم الحدوتة أو الشخصية</label>
      <input id="story-query" name="q" type="search" value="${safeQuery}" maxlength="80" dir="auto">
      <button class="action" type="submit">بحث</button>
    </form>
    <nav aria-label="اختار تصنيف">${navigation}</nav>
    ${query ? `<p class="search-result">${matchingVideos.length ? `نتائج البحث عن «${safeQuery}»` : `ملقيناش حدوتة باسم «${safeQuery}». جرّب اسمًا أقصر.`} <a href="${STORY_LIBRARY_PATH}">كل الحواديت</a></p>` : ''}
    ${storyList(matchingVideos)}`,
  });
}

export function renderCategory(category: PublicCategory, videos: VideoStory[]) {
  const { title, description } = CATEGORIES[category];
  return renderPage({
    title, description, pathname: categoryPath(category), noindex: !videos.length,
    body: `<h1>${title}</h1><p class="intro">${description}</p>
    ${videos.length ? storyList(videos) : '<p>الحواديت في التصنيف ده هتظهر لما تتوفر على القناة. تقدروا تتصفحوا <a href="/stories">مكتبة الحواديت</a>.</p>'}`,
  });
}

const informationContent = {
  '/about': `<p>قصة العائلة هو الموقع الرسمي لقناة <a href="${OFFICIAL_CHANNEL_URL}">قصة العائلة على يوتيوب</a>. بنقدّم حواديت ورسوم متحركة بالعربي للأطفال والعائلات.</p>
    <p>في المكتبة تقدروا تتفرجوا على حواديت الأميرات والحيوانات والمغامرات، وتلاقوا ألعاب زي الذاكرة وتركيب الصور والتلوين. بعض الحواديت معاها أسئلة تساعد الأهل يتكلموا مع الصغار بعد المشاهدة.</p>`,
  '/privacy': `<p>الموقع مخصص للأطفال والعائلات. مفيش تسجيل حساب أو دردشة داخل الموقع، ومبنطلبش من الأطفال أسماءهم أو عناوينهم أو صورهم.</p>
    <h2>إعدادات الموقع والألعاب</h2>
    <p>بنستخدم التخزين المحلي في المتصفح لحفظ المفضلة والوضع الليلي وإعدادات الصوت والترحيب. الألعاب بتشتغل في المتصفح، ورسومات التلوين اللي بتنزلها بتتحفظ على جهازك. تقدر تمسح الإعدادات دي من بيانات الموقع في المتصفح.</p>
    <h2>تشغيل الفيديوهات</h2>
    <p>الفيديوهات بتتعرض عبر مشغّل يوتيوب في وضع الخصوصية المحسّنة. يوتيوب بيستقبل معلومات الاتصال اللازمة لتشغيل الفيديو. لمزيد من التفاصيل، راجعوا <a href="https://policies.google.com/privacy?hl=ar">سياسة خصوصية Google</a>.</p>
    <h2>الإعلانات</h2>
    <p>بنستخدم كود Google AdSense لإثبات ملكية الموقع، وطلبات الإعلانات حاليًا متوقفة. لو فعّلنا الإعلانات بعد الموافقة، ممكن Google ومزوّدو الإعلانات يستخدموا ملفات تعريف الارتباط أو عنوان IP أو معرّفات مشابهة لعرض الإعلانات وقياسها. الموقع موجّه للأطفال، والإعلانات فيه تكون من غير تخصيص مبني على الاهتمامات. اقرأوا <a href="https://policies.google.com/technologies/partner-sites?hl=ar">إزاي Google بتستخدم البيانات من المواقع الشريكة</a>.</p>
    <h2>استفسارات أولياء الأمور</h2>
    <p>لو عندكم سؤال عن الخصوصية، استخدموا <a href="/contact">صفحة التواصل</a>.</p>`,
  '/contact': `<p>الصفحة دي لأولياء الأمور. لو عندكم سؤال أو ملاحظة على حدوتة أو واجهتم مشكلة في التشغيل، ابعتوا اسم الحدوتة ورابط صفحتها في رسالة لصفحة القناة الرسمية.</p>
    <p><a class="action" href="${FACEBOOK_URL}">صفحة قصة العائلة على فيسبوك</a></p>
    <p>لو الرسالة عن طفل، يكفي وصف المشكلة من غير إرسال اسمه أو صوره أو أي بيانات شخصية عنه.</p>`,
};

export function renderInformation(pathname: keyof typeof INFORMATION_PAGES) {
  const title = INFORMATION_PAGES[pathname];
  return renderPage({
    title, pathname,
    description: title + ' على موقع قصة العائلة للحواديت والرسوم المتحركة بالعربي للأطفال.',
    body: `<article class="panel info"><h1>${title}</h1>${informationContent[pathname]}</article>`,
  });
}
