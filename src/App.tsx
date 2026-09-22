import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoriesFilter } from './components/CategoriesFilter';
import { VideoGrid } from './components/VideoGrid';
import { NotificationsModal } from './components/NotificationsModal';
import { ChannelBanner } from './components/ChannelBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { INITIAL_VIDEOS } from './data/videos';
import { VideoStory, StoryCategory, AppNotification } from './types';
import { playCutePop, playSparkleChime } from './utils/audio';

const STORAGE_KEYS = {
  FAVORITES: 'qessa_family_favs_v2',
  NIGHT_MODE: 'qessa_family_night_v2',
  SOUND_ENABLED: 'qessa_family_sound_v2',
  NOTIFICATIONS: 'qessa_family_notifs_v2',
};

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'حكاية جديدة نزلت الآن! 🎬',
    message: 'شاهد مغامرة الكلب بولت والقوى الخارقة حصرياً على قناة قصة العائلة.',
    date: 'اليوم',
    videoId: 'S5h4O4sRkNA',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'رحلة عبر الزمن مع روبنسون 🚀',
    message: 'حلقة مشوقة جداً للأطفال عن عائلة روبنسون والسفر للمستقبل.',
    date: 'أمس',
    videoId: 'zKilkVjn7Ac',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'حكايات الأميرات الكلاسيكية 👑',
    message: 'تمت إضافة قصة الأميرة رابونزل وسر الشعر الطويل بدقة عالية.',
    date: 'هذا الأسبوع',
    videoId: '79NgvahMshg',
    read: true,
  },
];

export default function App() {
  // 1. Night Mode State (Bedtime mode for comfortable eyes)
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.NIGHT_MODE);
      if (saved !== null) return JSON.parse(saved);
      const hour = new Date().getHours();
      return hour >= 20 || hour < 6;
    }
    return false;
  });

  // 2. Sound Effects Enabled State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (saved !== null) return JSON.parse(saved);
    }
    return true;
  });

  // 3. Videos List (Latest video is the first item)
  const [videos] = useState<VideoStory[]>(INITIAL_VIDEOS);
  const [currentVideo, setCurrentVideo] = useState<VideoStory>(INITIAL_VIDEOS[0]);

  // 4. Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return ['S5h4O4sRkNA', '79NgvahMshg', 'v6v0t-NU2lU'];
  });

  // 5. Filtering State
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 6. Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);

  // Sync Night Mode Class to <html>
  useEffect(() => {
    if (isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.NIGHT_MODE, JSON.stringify(isNightMode));
  }, [isNightMode]);

  // Sync Sound
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Sync Favorites to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  // Sync Notifications
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // Deep Link & URL query param listener (Supports /?v=VIDEO_ID and /?category=CATEGORY)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const videoIdParam = searchParams.get('v');
      const categoryParam = searchParams.get('category') as StoryCategory | null;

      if (videoIdParam) {
        const found = INITIAL_VIDEOS.find((v) => v.id === videoIdParam);
        if (found) {
          setCurrentVideo(found);
          document.title = `${found.cleanTitle} | قصة العائلة`;
        }
      }

      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
    }
  }, []);

  // Update URL param and document title when currentVideo changes
  const handleSelectVideo = (video: VideoStory) => {
    setCurrentVideo(video);
    document.title = `${video.cleanTitle} | قصة العائلة - حكايات ورسوم متحركة للأطفال`;
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('v', video.id);
      window.history.replaceState({}, '', url.toString());
    }
    window.scrollTo({ top: 40, behavior: 'smooth' });
  };

  // Audio Triggers
  const triggerCutePop = useCallback(() => {
    playCutePop(soundEnabled);
  }, [soundEnabled]);

  const triggerSparkle = useCallback(() => {
    playSparkleChime(soundEnabled);
  }, [soundEnabled]);

  // Favorite toggle handler
  const handleToggleFavorite = (videoId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(videoId);
      if (!exists) {
        triggerSparkle();
        return [...prev, videoId];
      } else {
        triggerCutePop();
        return prev.filter((id) => id !== videoId);
      }
    });
  };

  // Filtered videos based on category and search
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // 1. Favorites Category Filter
      if (selectedCategory === 'favorites') {
        if (!favorites.includes(video.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (video.category !== selectedCategory) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = video.cleanTitle.toLowerCase().includes(query) || video.title.toLowerCase().includes(query);
        const matchesDesc = video.description.toLowerCase().includes(query);
        const matchesMoral = video.moralLesson?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesMoral;
      }

      return true;
    });
  }, [videos, selectedCategory, searchQuery, favorites]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<StoryCategory, number> = {
      all: videos.length,
      princesses: 0,
      animals: 0,
      bedtime: 0,
      adventure: 0,
      fantasy: 0,
      favorites: favorites.length,
    };

    videos.forEach((v) => {
      if (counts[v.category] !== undefined) {
        counts[v.category]++;
      }
    });

    return counts;
  }, [videos, favorites]);

  // Featured videos for top shelf
  const featuredVideos = useMemo(() => {
    return videos.filter((v) => v.isFeatured && v.id !== currentVideo.id);
  }, [videos, currentVideo]);

  // Notification toggle
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification('قناة قصة العائلة', {
              body: 'تم تفعيل التنبيهات بنجاح! ستصلك أحدث الحلقات الكرتونية فور نشرها.',
              icon: '/logo.jpg',
            });
          }
        } catch {}
      }
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const handleGoHome = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFavorites = () => {
    setSelectedCategory('favorites');
    setSearchQuery('');
    const gridEl = document.getElementById('stories-library');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  const handleFocusSearch = () => {
    const searchInput = document.getElementById('mobile-search-input');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 pb-20 md:pb-0">
      
      {/* 1. Header with Channel Identity, Bedtime Switcher, Favorites & Sound Toggle */}
      <Header
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        favoritesCount={favorites.length}
        onOpenFavorites={handleOpenFavorites}
        onOpenNotifications={() => {
          setIsNotificationsModalOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        unreadNotifications={unreadNotificationsCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        onSoundTrigger={triggerCutePop}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-5 sm:space-y-8">
        
        {/* 2. Hero Section: Displays the Latest Upload Automatically & Currently Selected Story */}
        <HeroFeatured
          currentVideo={currentVideo}
          isFavorite={favorites.includes(currentVideo.id)}
          onToggleFavorite={handleToggleFavorite}
          onSoundTrigger={triggerCutePop}
          isLatestUpload={currentVideo.id === INITIAL_VIDEOS[0].id}
        />

        {/* 3. Kid-Friendly Colorful Categories Pill Selector */}
        <CategoriesFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
          }}
          categoryCounts={categoryCounts}
          onSoundTrigger={triggerCutePop}
        />

        {/* 4. Stories Grid & Dedicated Featured Episodes Section */}
        <div id="stories-library">
          <VideoGrid
            videos={filteredVideos}
            featuredVideos={featuredVideos}
            activeVideoId={currentVideo.id}
            favorites={favorites}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectVideo={(video) => {
              handleSelectVideo(video);
            }}
            onToggleFavorite={handleToggleFavorite}
            onSoundTrigger={triggerCutePop}
            onResetCategory={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
          />
        </div>

      </main>

      {/* 5. Channel Highlight Card & Safe Guarantee Footer */}
      <ChannelBanner
        onSoundTrigger={triggerCutePop}
      />

      {/* 6. Notifications & Alerts Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        onSelectVideoById={(id) => {
          const found = videos.find((v) => v.id === id);
          if (found) {
            handleSelectVideo(found);
          }
        }}
        onSoundTrigger={triggerCutePop}
      />

      {/* 7. Mobile Bottom Navigation Bar (Automatic for phones & tablets) */}
      <MobileBottomNav
        selectedCategory={selectedCategory}
        onGoHome={handleGoHome}
        favoritesCount={favorites.length}
        onOpenFavorites={handleOpenFavorites}
        unreadNotifications={unreadNotificationsCount}
        onOpenNotifications={() => {
          setIsNotificationsModalOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        onFocusSearch={handleFocusSearch}
        onSoundTrigger={triggerCutePop}
      />

    </div>
  );
}
