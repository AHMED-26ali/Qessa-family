import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoriesFilter } from './components/CategoriesFilter';
import { VideoGrid } from './components/VideoGrid';
import { ChannelBanner } from './components/ChannelBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { WelcomeModal } from './components/WelcomeModal';
import { PrivacyModal } from './components/PrivacyModal';
import { GamesHub } from './components/games/GamesHub';
import { INITIAL_VIDEOS } from './data/videos';
import { VideoStory, StoryCategory } from './types';
import { playCutePop, playSparkleChime } from './utils/audio';
import { matchesSearchQuery } from './utils/search';
import { fetchVideosFromApi, fetchVideoById, refreshChannelVideos } from './utils/apiClient';

const STORAGE_KEYS = {
  FAVORITES: 'qessa_family_favs_v2',
  NIGHT_MODE: 'qessa_family_night_v2',
  SOUND_ENABLED: 'qessa_family_sound_v2',
  WELCOME_DISMISSED: 'qessa_family_welcome_dismissed_v2',
};

export default function App() {
  // 1. Night Mode State (Bedtime mode for comfortable eyes)
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.NIGHT_MODE);
      if (saved !== null) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
      const hour = new Date().getHours();
      return hour >= 20 || hour < 6;
    }
    return false;
  });

  // 2. Sound Effects Enabled State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED);
      if (saved !== null) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return true;
  });

  // 3. Favorites State (persisted in localStorage)
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });

  // 4. Videos List & Latest Video (newest episode appears first)
  const [videos, setVideos] = useState<VideoStory[]>(() => {
    return INITIAL_VIDEOS;
  });

  const [currentVideo, setCurrentVideo] = useState<VideoStory>(() => {
    return INITIAL_VIDEOS[0];
  });

  // Keep an intentionally selected video playing during automatic sync.
  // On a fresh visit, the big player always shows the newest upload.
  const userSelectedVideoRef = useRef(false);

  // 5. Filtering & Search State
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 6. Sync & Refresh Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState<string>('');

  // 7. Modals: Welcome Modal & Privacy Policy Modal
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(STORAGE_KEYS.WELCOME_DISMISSED);
      return dismissed !== 'true';
    }
    return false;
  });

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Sync Night Mode Class to <html>
  useEffect(() => {
    if (isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.NIGHT_MODE, JSON.stringify(isNightMode));
    } catch {}
  }, [isNightMode]);

  // Sync Sound Preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Sync Favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const handleToggleFavorite = (videoId: string) => {
    setFavorites((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId);
      }
      return [...prev, videoId];
    });
  };

  // Audio Triggers
  const triggerCutePop = useCallback(() => {
    playCutePop(soundEnabled);
  }, [soundEnabled]);

  const triggerSparkle = useCallback(() => {
    playSparkleChime(soundEnabled);
  }, [soundEnabled]);

  // Initial Data Fetch from Server API
  useEffect(() => {
    let isMounted = true;

    const loadVideos = async () => {
      try {
        const result = await fetchVideosFromApi(false);
        if (!isMounted || !result.videos.length) return;

        setVideos(result.videos);

        // Offline / bundled data can have no known synchronization time.
        if (result.lastSynced && !Number.isNaN(Date.parse(result.lastSynced))) {
          setLastSyncedText(new Date(result.lastSynced).toLocaleTimeString('ar-EG'));
        }

        // Do not interrupt a story chosen by the visitor or a shared ?v= link.
        // Otherwise, select the first item, which the server orders newest-first.
        const videoIdInUrl = new URLSearchParams(window.location.search).get('v');
        if (!videoIdInUrl && !userSelectedVideoRef.current) {
          setCurrentVideo(result.videos[0]);
        }
      } catch (e) {
        console.warn('Initial videos load warning:', e);
      }
    };

    loadVideos();

    // Periodic background sync every 8 minutes
    const interval = setInterval(() => {
      loadVideos();
    }, 8 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handle Manual Refresh
  const handleRefreshStories = async () => {
    triggerCutePop();
    setIsSyncing(true);
    try {
      const res = await refreshChannelVideos();
      if (res.success && res.videos.length > 0) {
        setVideos(res.videos);
        setCurrentVideo(res.videos[0]);
        userSelectedVideoRef.current = false;
        setLastSyncedText(new Date().toLocaleTimeString('ar-EG'));

        // Remove a previously selected video from the URL so the next
        // automatic sync can keep the newest episode on the big screen.
        const url = new URL(window.location.href);
        url.searchParams.delete('v');
        window.history.replaceState({}, '', url.toString());
        document.title = `${res.videos[0].cleanTitle} | قصة العائلة`;
        triggerSparkle();
      } else {
        console.warn('YouTube refresh did not complete:', res.message);
        setLastSyncedText('تعذر التحديث - القصص المحفوظة متاحة');
      }
    } catch (e) {
      console.warn('Manual refresh error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Deep Link Listener (?v=VIDEO_ID and ?category=CAT and ?section=games)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const videoIdParam = searchParams.get('v');
    const categoryParam = searchParams.get('category') as StoryCategory | null;
    const sectionParam = searchParams.get('section');

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (sectionParam === 'games') {
      setTimeout(() => {
        const gamesEl = document.getElementById('games-world');
        if (gamesEl) gamesEl.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }

    if (videoIdParam) {
      userSelectedVideoRef.current = true;
      const found = videos.find((v) => v.id === videoIdParam);
      if (found) {
        setCurrentVideo(found);
        document.title = `${found.cleanTitle} | قصة العائلة`;
      } else {
        // Dynamic fetch for unlisted or newly published video direct link!
        fetchVideoById(videoIdParam).then((fetched) => {
          if (fetched) {
            // A deep link must not falsely promote an older story to newest.
            setVideos((prev) =>
              prev.some((v) => v.id === fetched.id)
                ? prev
                : [...prev, { ...fetched, isFeatured: false }]
            );
            setCurrentVideo(fetched);
            document.title = `${fetched.cleanTitle} | قصة العائلة`;
          }
        });
      }
    }
  }, [videos]);

  // Video Selection
  const handleSelectVideo = (video: VideoStory) => {
    userSelectedVideoRef.current = true;
    setCurrentVideo(video);
    document.title = `${video.cleanTitle} | قصة العائلة - حكايات ورسوم متحركة للأطفال`;
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.set('v', video.id);
      window.history.replaceState({}, '', url.toString());
    }
    window.scrollTo({ top: 30, behavior: 'smooth' });
  };

  // Welcome Modal handlers
  const handleCloseWelcome = () => {
    setIsWelcomeModalOpen(false);
  };

  const handleToggleDontShowWelcomeAgain = (checked: boolean) => {
    try {
      if (checked) {
        localStorage.setItem(STORAGE_KEYS.WELCOME_DISMISSED, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEYS.WELCOME_DISMISSED);
      }
    } catch {}
  };

  // Navigation Helpers
  const handleGoHome = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    userSelectedVideoRef.current = false;
    if (videos.length > 0) {
      setCurrentVideo(videos[0]);
      document.title = `${videos[0].cleanTitle} | قصة العائلة`;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('v');
    window.history.replaceState({}, '', url.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFavorites = () => {
    setSelectedCategory('favorites');
    setSearchQuery('');
    const gridEl = document.getElementById('stories-library');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenGames = () => {
    const gamesEl = document.getElementById('games-world');
    if (gamesEl) {
      gamesEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFocusSearch = () => {
    const searchInput = document.getElementById('mobile-search-input');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    }
  };

  // The newest upload is already in the main player. Show the previous
  // uploads in the regular stories grid, with no duplicate featured video.
  // Favorites and searches can still find the newest story when requested.
  const libraryVideos = useMemo(() => videos.slice(1), [videos]);

  // Filtered stories based on category & search query
  const filteredVideos = useMemo(() => {
    const candidates =
      selectedCategory === 'favorites' || searchQuery.trim()
        ? videos
        : libraryVideos;

    return candidates.filter((video) => {
      // 1. Search Query Filter with comprehensive Arabic normalization
      if (searchQuery.trim()) {
        const matches = matchesSearchQuery(
          [video.cleanTitle, video.title, video.description, video.moralLesson, video.categoryNameAr],
          searchQuery
        );
        if (!matches) return false;
        return true;
      }

      // 2. Favorites category
      if (selectedCategory === 'favorites') {
        return favorites.includes(video.id);
      }

      // 3. Category filtering
      if (selectedCategory !== 'all') {
        return video.category === selectedCategory;
      }

      return true;
    });
  }, [videos, libraryVideos, selectedCategory, searchQuery, favorites]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<StoryCategory, number> = {
      all: libraryVideos.length,
      princesses: 0,
      animals: 0,
      bedtime: 0,
      adventure: 0,
      fantasy: 0,
      favorites: favorites.length,
    };

    libraryVideos.forEach((v) => {
      if (counts[v.category] !== undefined) {
        counts[v.category]++;
      }
    });

    return counts;
  }, [libraryVideos, favorites]);

  // Featured videos for top shelf (excluding currently playing story)
  const featuredVideos = useMemo(() => {
    return libraryVideos.filter((v) => v.isFeatured && v.id !== currentVideo.id);
  }, [libraryVideos, currentVideo]);

  // Is current video the newest episode?
  const isLatestUpload = videos.length > 0 && currentVideo.id === videos[0].id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 pb-20 md:pb-0">
      
      {/* 1. Header with Channel Identity, Bedtime Switcher, Favorites & Games */}
      <Header
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        favoritesCount={favorites.length}
        onOpenFavorites={handleOpenFavorites}
        onOpenNotifications={() => {}}
        unreadNotifications={0}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSoundTrigger={triggerCutePop}
        videos={videos}
        onSelectVideo={handleSelectVideo}
        onSearchSubmit={() => {
          const el = document.getElementById('stories-library');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenGames={handleOpenGames}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-6 sm:space-y-10">
        
        {/* 2. Hero Featured Story & Player (With Play-Along Option) */}
        <HeroFeatured
          currentVideo={currentVideo}
          onSoundTrigger={triggerCutePop}
          isLatestUpload={isLatestUpload}
          onRefreshLatest={handleRefreshStories}
          isSyncing={isSyncing}
          lastSyncedText={lastSyncedText}
          isFavorite={favorites.includes(currentVideo.id)}
          onToggleFavorite={handleToggleFavorite}
          onOpenGamesWorld={handleOpenGames}
        />

        {/* 3. 🎮 عالم ألعاب قصة العائلة (6 Interactive Games Hub) */}
        <GamesHub
          soundEnabled={soundEnabled}
          onPlaySound={triggerCutePop}
        />

        {/* 4. Story Categories Filter Pills */}
        <div id="stories-library">
          <CategoriesFilter
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSearchQuery('');
            }}
            categoryCounts={categoryCounts}
            onSoundTrigger={triggerCutePop}
          />
        </div>

        {/* 5. Stories Grid Library */}
        <VideoGrid
          videos={filteredVideos}
          featuredVideos={featuredVideos}
          activeVideoId={currentVideo.id}
          favorites={favorites}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onSelectVideo={handleSelectVideo}
          onToggleFavorite={handleToggleFavorite}
          onSoundTrigger={triggerCutePop}
          onResetCategory={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}
        />

      </main>

      {/* 6. Channel Info & Official Footer */}
      <ChannelBanner
        onSoundTrigger={triggerCutePop}
        onOpenWelcome={() => setIsWelcomeModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* 7. Mobile Floating Bottom Bar with 5 icons */}
      <MobileBottomNav
        selectedCategory={selectedCategory}
        onGoHome={handleGoHome}
        favoritesCount={favorites.length}
        onOpenFavorites={handleOpenFavorites}
        onOpenGames={handleOpenGames}
        isNightMode={isNightMode}
        onToggleNightMode={() => setIsNightMode((prev) => !prev)}
        onFocusSearch={handleFocusSearch}
        onSoundTrigger={triggerCutePop}
      />

      {/* 8. Welcome Modal: Shows on first visit or on demand */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleCloseWelcome}
        onSoundTrigger={triggerCutePop}
        soundEnabled={soundEnabled}
        dontShowAgain={typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.WELCOME_DISMISSED) === 'true'}
        onToggleDontShowAgain={handleToggleDontShowWelcomeAgain}
      />

      {/* 9. Privacy & Child Safety Modal for Parents */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

    </div>
  );
}
