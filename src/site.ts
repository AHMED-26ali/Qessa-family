export const SITE_URL = 'https://qessa-family.vercel.app';
export const STORY_LIBRARY_PATH = '/stories';
export const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export const CATEGORIES = {
  bedtime: {
    title: 'حواديت قبل النوم للأطفال',
    description: 'اختاروا حدوتة قصيرة تقرؤوها أو تتفرجوا عليها سوا قبل النوم. هنا حكايات عن الصدق والفضول، من ليلى والرداء الأحمر إلى راعي الغنم.',
  },
  princesses: {
    title: 'قصص الأميرات للأطفال',
    description: 'شاهدوا حكايات الأميرات بالعربي، من سندريلا والحذاء الزجاجي إلى رابونزل في البرج والأميرة النائمة. اختاروا حكاية وناقشوا مع الصغار القرارات اللي أخدتها بطلتها.',
  },
  animals: {
    title: 'قصص الحيوانات للأطفال',
    description: 'حكايات بالعربي أبطالها حيوانات، من الثعلب مكرون إلى الأرنب والسلحفاة. اختاروا قصة عن الصدق أو الصداقة أو المثابرة واتفرجوا عليها مع العيلة.',
  },
  adventure: {
    title: 'حكايات المغامرات والأساطير',
    description: 'رحلات بحرية وغابات بعيدة وأماكن سحرية في حكايات بالعربي للأطفال. اكتشفوا مع السندباد وأبطال المغامرات كيف يتصرفوا لما خططهم تتغيّر.',
  },
  fantasy: {
    title: 'قصص الخيال للأطفال',
    description: 'حكايات عن السفر عبر الزمن والكواكب والأماكن العجيبة. اختاروا رحلة من عالم الخيال واسألوا الصغار إيه المكان اللي نفسهم يزوروه فيها.',
  },
};

export type PublicCategory = keyof typeof CATEGORIES;

export const INFORMATION_PAGES = {
  '/about': 'عن قصة العائلة',
  '/privacy': 'سياسة الخصوصية',
  '/contact': 'التواصل',
};

export function isPublicCategory(value: string): value is PublicCategory {
  return Object.hasOwn(CATEGORIES, value);
}

export function storyPath(id: string) {
  return STORY_LIBRARY_PATH + '/' + id;
}

export function categoryPath(category: PublicCategory) {
  return '/categories/' + category;
}

export function thumbnailUrl(id: string) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
}

export function playerUrl(id: string) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=0&playsinline=1&rel=0';
}
