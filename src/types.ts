
export type StoryCategory =
  | 'all'
  | 'princesses'
  | 'animals'
  | 'bedtime'
  | 'adventure'
  | 'fantasy'
  | 'favorites';

export interface VideoStory {
  id: string;
  title: string;
  cleanTitle: string;
  description: string;
  category: StoryCategory;
  categoryNameAr: string;
  duration: string;
  viewsApprox: string;
  isFeatured?: boolean;
  ageRecommendation: '3+' | '5+' | '7+';
  moralLesson?: string;
  publishedDate?: string;
  keywords?: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  videoId?: string;
  read: boolean;
}

export interface PopularKeyword {
  tag: string;
  label: string;
  emoji: string;
  category?: StoryCategory;
}
