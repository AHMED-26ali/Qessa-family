import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoriesFilter } from './components/CategoriesFilter';
import { VideoGrid } from './components/VideoGrid';
import { ChannelBanner } from './components/ChannelBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { INITIAL_VIDEOS } from './data/videos';
import { VideoStory, StoryCategory, AppNotification } from './types';
import { playCutePop, playSparkleChime } from './utils/audio';
import { matchesSearchQuery } from './utils/search';
import { loadAllVideos, saveCustomVideos, fetchLatestChannelEpisodes } from './utils/youtubeLiveSync';

const STORAGE_KEYS = {
  FAVORITES: 'qessa_family_favs_v2',
  NIGHT_MODE: 'qessa_family_night_v2',
  SOUND_ENABLED: 'qessa_family_sound_v2',
};

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

  // 3. Videos List & Latest Video (Automatically loads newest video first)
  const [videos, setVideos] = useState<VideoStory[]>(() => loadAllVideos());
  const [currentVideo, setCurrentVideo] = useState<VideoStory>(() => {
    const all = loadAllVideos();
    return all[0] || INITIAL_VIDEOS[0];
  });

  // 4. Filtering State
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 5. Welcome Modal: Shows AUTOMATICALLY every time the site is opened or refreshed
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(true);

  const handleCloseWelcome = () => {
    setIsWelcomeModalOpen(false);
  };

  // 6. Automatic Live Synchronization for Latest Uploads
  // Checks YouTube channel feed and updates the latest episode automatically
  useEffect(() => {
    let isMounted = true;

    const syncChannel = async () => {
      try {
        const fresh = await fetchLatestChannelEpisodes();
        if (!isMounted || fresh.length === 0) return;

        setVideos((prev) => {
          const existingIds = new Set(prev.map((v) => v.id));
          const trulyNew = fresh.filter((v) => !existingIds.has(v.id));

          if (trulyNew.length > 0) {
            const merged = [...trulyNew, ...prev];
            saveCustomVideos(merged);

            // Auto-update Hero Section to the newly released episode!
            setCurrentVideo(merged[0]);
            return merged;
          }
          return prev;
        });
      } catch (e) {
        // Silently keep current video list
      }
    };

    syncChannel();

    // Check periodically (every 10 minutes) while app is open
    const interval = setInterval(syncChannel, 10 * 60 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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

  // Filtered videos based on category and search
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      // 1. Search Query Filter with Arabic normalization
      if (searchQuery.trim()) {
        const matches = matchesSearchQuery(
          [video.cleanTitle, video.title, video.description, video.moralLesson, video.categoryNameAr],
          searchQuery
        );
        if (!matches) return false;
        return true;
      }

      // Standard category filtering
      if (selectedCategory !== 'all') {
        return video.category === selectedCategory;
      }

      return true;
    });
  }, [videos, selectedCategory, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<StoryCategory, number> = {
      all: videos.length,
      princesses: 0,
      animals: 0,
      bedtime: 0,
      adventure: 0,
      fantasy: 0,
      favorites: 0,
    };

    videos.forEach((v) => {
      if (counts[v.category] !== undefined) {
        counts[v.category]++;
      }
    });

    return counts;
  }, [videos]);

  // Featured videos for top shelf
  const featuredVideos = useMemo(() => {
    return videos.filter((v) => v.isFeatured && v.id !== currentVideo.id);
  }, [videos, currentVideo]);

  const handleGoHome = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = () => {
    const gridEl = document.getElementById('stories-library');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
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
      
      {/* 1. Header with Channel Identity, Bedtime Switcher & Sound Toggle */}
      <Header
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        favoritesCount={0}
        onOpenFavorites={() => {}}
        onOpenNotifications={() => {}}
        unreadNotifications={0}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        onSoundTrigger={triggerCutePop}
        videos={videos}
        onSelectVideo={handleSelectVideo}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-5 sm:space-y-8">
        
        {/* 2. Hero Section: Displays the Latest Upload Automatically & Currently Selected Story */}
        <HeroFeatured
          currentVideo={currentVideo}
          onSoundTrigger={triggerCutePop}
          isLatestUpload={currentVideo.id === videos[0]?.id}
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
            favorites={[]}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            onSelectVideo={(video) => {
              handleSelectVideo(video);
            }}
            onToggleFavorite={() => {}}
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

      {/* 6. Welcome Screen Modal: Opens AUTOMATICALLY ONLY on the first visit */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleCloseWelcome}
        onSoundTrigger={triggerSparkle}
        soundEnabled={soundEnabled}
      />

      {/* 7. Mobile Bottom Navigation Bar (Streamlined) */}
      <MobileBottomNav
        selectedCategory={selectedCategory}
        onGoHome={handleGoHome}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        onFocusSearch={handleFocusSearch}
        onSoundTrigger={triggerCutePop}
      />

    </div>
  );
}
