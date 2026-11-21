import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { HeroFeatured } from './components/HeroFeatured';
import { CategoriesFilter } from './components/CategoriesFilter';
import { VideoGrid } from './components/VideoGrid';
import { ChannelBanner } from './components/ChannelBanner';
import { MobileBottomNav } from './components/MobileBottomNav';
import { GamesHub } from './components/games/GamesHub';
import { INITIAL_VIDEOS } from './data/videos';
import { VideoStory, StoryCategory } from './types';
import { playCutePop, playSparkleChime } from './utils/audio';
import { matchesSearchQuery } from './utils/search';
import { fetchVideosFromApi, refreshChannelVideos } from './utils/apiClient';
import { storyPath, STORY_LIBRARY_PATH } from './site';

const STORAGE_KEYS = {
  FAVORITES: 'qessa_family_favs_v2',
  NIGHT_MODE: 'qessa_family_night_v2',
  SOUND_ENABLED: 'qessa_family_sound_v2',
};

function readPreference(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

function savePreference(key: string, value: boolean | string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function App() {
  const [isNightMode, setIsNightMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // The channel feed supplies the featured upload. The bundled archive has no live order.
  const [videos, setVideos] = useState<VideoStory[]>(INITIAL_VIDEOS);
  const [catalogSource, setCatalogSource] = useState('loading');
  const currentVideo = catalogSource === 'loading' || catalogSource === 'fallback'
    ? undefined
    : videos[0];

  // 5. Filtering & Search State
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 6. Sync & Refresh Status
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    const nightMode = readPreference(STORAGE_KEYS.NIGHT_MODE);
    const sound = readPreference(STORAGE_KEYS.SOUND_ENABLED);
    const savedFavorites = readPreference(STORAGE_KEYS.FAVORITES);

    setIsNightMode(typeof nightMode === 'boolean' ? nightMode : hour >= 20 || hour < 6);
    setSoundEnabled(typeof sound === 'boolean' ? sound : true);
    if (Array.isArray(savedFavorites)) {
      setFavorites(savedFavorites.filter((id): id is string => typeof id === 'string'));
    }
    setPreferencesLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded) return;
    document.documentElement.classList.toggle('dark', isNightMode);
    savePreference(STORAGE_KEYS.NIGHT_MODE, isNightMode);
  }, [isNightMode, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) savePreference(STORAGE_KEYS.SOUND_ENABLED, soundEnabled);
  }, [soundEnabled, preferencesLoaded]);

  useEffect(() => {
    if (preferencesLoaded) savePreference(STORAGE_KEYS.FAVORITES, favorites);
  }, [favorites, preferencesLoaded]);

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
        setCatalogSource(result.source);

        // Offline / bundled data can have no known synchronization time.
        if (result.lastSynced && !Number.isNaN(Date.parse(result.lastSynced))) {
          setLastSyncedText(new Date(result.lastSynced).toLocaleTimeString('ar-EG'));
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
        setCatalogSource('live');
        setLastSyncedText(new Date().toLocaleTimeString('ar-EG'));

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

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('section') !== 'games') return;

    const timeout = setTimeout(() => {
      document.getElementById('games-world')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleSelectVideo = (video: VideoStory) => {
    window.location.assign(storyPath(video.id));
  };

  // Navigation Helpers
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
  const libraryVideos = useMemo(() => currentVideo ? videos.slice(1) : videos, [videos, currentVideo]);

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

    videos.forEach((v) => {
      if (counts[v.category] !== undefined) {
        counts[v.category]++;
      }
    });

    return counts;
  }, [videos, libraryVideos, favorites]);

  // Featured videos for top shelf (excluding currently playing story)
  const featuredVideos = useMemo(() => {
    return libraryVideos.filter((v) => v.isFeatured && v.id !== currentVideo?.id);
  }, [libraryVideos, currentVideo]);

  // Is current video the newest episode?
  const isLatestUpload = catalogSource === 'live' || catalogSource === 'api' || catalogSource === 'scraper';

  return (
    <div className="home-screen min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300 pb-20 md:pb-0">
      
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
        onOpenGames={handleOpenGames}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-6 sm:space-y-10">
        
        <section className="home-story-intro">
          <div className="hero-story-copy">
            <h2>حواديت أطفال بالعربي</h2>
            <p>اتفرّجوا على حكاية من قصة العائلة، أو اختاروا لعبة تلعبوها سوا.</p>
            <div className="hero-story-actions">
              <a href={STORY_LIBRARY_PATH}>مكتبة الحواديت</a>
              <a href="#games-world">عالم الألعاب</a>
            </div>
          </div>
          <div className="home-story-decoration" aria-hidden="true">
            <img
              src="/brand-logo-144.webp"
              srcSet="/brand-logo-144.webp 144w, /brand-logo-288.webp 288w"
              sizes="(min-width: 760px) 144px, (min-width: 390px) 19vw, 74px"
              width="144"
              height="144"
              fetchPriority="high"
              alt=""
            />
            <span className="home-story-star">✦</span>
            <span className="home-story-star second">✦</span>
          </div>
        </section>

        {/* 2. Hero Featured Story & Player (With Play-Along Option) */}
        <HeroFeatured
          currentVideo={currentVideo}
          isLoading={catalogSource === 'loading'}
          onSoundTrigger={triggerCutePop}
          isLatestUpload={isLatestUpload}
          onRefreshLatest={handleRefreshStories}
          isSyncing={isSyncing}
          lastSyncedText={lastSyncedText}
          isFavorite={currentVideo ? favorites.includes(currentVideo.id) : false}
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
          activeVideoId={currentVideo?.id ?? ''}
          favorites={favorites}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onToggleFavorite={handleToggleFavorite}
          onSoundTrigger={triggerCutePop}
          onResetCategory={() => {
            setSelectedCategory('all');
            setSearchQuery('');
          }}
        />

      </main>

      {/* 6. Channel Info & Official Footer */}
      <ChannelBanner onSoundTrigger={triggerCutePop} />

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

    </div>
  );
}
