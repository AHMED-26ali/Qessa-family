import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Youtube, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Moon, 
  Sparkles, 
  Crown,
  Compass,
  ArrowLeft,
  Wand2,
  Stars,
  Heart
} from 'lucide-react';
import { OFFICIAL_CHANNEL_URL, CHANNEL_HANDLE } from '../data/videos';
import { playWelcomeFairytaleMelody, stopWelcomeMelody } from '../utils/audio';
import fantasyBg from '../assets/images/fantasy_welcome_bg_1790414038986.jpg';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSoundTrigger: () => void;
  soundEnabled?: boolean;
  dontShowAgain?: boolean;
  onToggleDontShowAgain?: (value: boolean) => void;
}

interface InteractiveStar {
  id: number;
  x: number;
  y: number;
}

const FALLING_STARS = [
  { id: 'fs-1', top: '6%', right: '12%', delay: '0s', duration: '3.4s' },
  { id: 'fs-2', top: '22%', right: '38%', delay: '1.4s', duration: '3.1s' },
  { id: 'fs-3', top: '4%', right: '68%', delay: '2.6s', duration: '3.8s' },
  { id: 'fs-4', top: '32%', right: '16%', delay: '4.2s', duration: '3.5s' },
  { id: 'fs-5', top: '14%', right: '86%', delay: '5.6s', duration: '3.6s' },
  { id: 'fs-6', top: '48%', right: '52%', delay: '7.0s', duration: '3.2s' },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onSoundTrigger,
  soundEnabled = true,
  onToggleDontShowAgain,
}) => {
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStoryPillar, setActiveStoryPillar] = useState<number | null>(null);
  const [interactiveStars, setInteractiveStars] = useState<InteractiveStar[]>([]);

  // Automatically play gentle fairytale welcome music on its own when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopWelcomeMelody();
      return;
    }

    if (!soundEnabled) return;

    let hasPlayed = false;

    const playMelody = () => {
      if (hasPlayed) return;
      hasPlayed = true;
      playWelcomeFairytaleMelody(true);
    };

    // 1. Immediate background autoplay attempt
    playMelody();

    // 2. Gesture fallback for strict browser autoplay policies:
    // Starts music automatically on the very first touch/click/key anywhere on the page
    const handleFirstGesture = () => {
      if (!hasPlayed) {
        playMelody();
      }
      removeGestureListeners();
    };

    const removeGestureListeners = () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true, passive: true });

    return () => {
      removeGestureListeners();
      stopWelcomeMelody();
    };
  }, [isOpen, soundEnabled]);

  // Spawn an interactive shooting star on click/tap
  const handleBannerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newStar: InteractiveStar = { id: Date.now() + Math.random(), x, y };

    setInteractiveStars((prev) => [...prev.slice(-5), newStar]);
    onSoundTrigger();

    setTimeout(() => {
      setInteractiveStars((prev) => prev.filter((s) => s.id !== newStar.id));
    }, 2400);
  };

  // Focus primary button on open, lock scroll, and handle Escape key
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startButtonRef.current?.focus();
      }, 150);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };

      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  // Magical Stardust / Fairy Dust Particle Animation Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool with whimsical colors (gold, amber, rose, cyan, white)
    const particleColors = [
      'rgba(251, 191, 36, 0.85)', // Gold
      'rgba(244, 63, 94, 0.85)',  // Rose
      'rgba(168, 85, 247, 0.85)', // Purple
      'rgba(56, 189, 248, 0.85)', // Sky
      'rgba(255, 255, 255, 0.95)', // White starlight
    ];

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      color: string;
      alpha: number;
      alphaChange: number;
      pulseSpeed: number;
      angle: number;
    }

    const particles: Particle[] = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedY: -(Math.random() * 0.6 + 0.2), // Gently floating upwards
      speedX: (Math.random() - 0.5) * 0.5,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      alpha: Math.random() * 0.7 + 0.3,
      alphaChange: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
      pulseSpeed: Math.random() * 0.05 + 0.02,
      angle: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.4 + p.speedX;
        p.angle += p.pulseSpeed;

        // Twinkle alpha
        p.alpha += p.alphaChange;
        if (p.alpha > 0.95 || p.alpha < 0.2) {
          p.alphaChange = -p.alphaChange;
        }

        // Wrap around top
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw glowing particle star
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Cross sparkle for larger particles
        if (p.size > 2.2) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - p.size * 2, p.y);
          ctx.lineTo(p.x + p.size * 2, p.y);
          ctx.moveTo(p.x, p.y - p.size * 2);
          ctx.lineTo(p.x, p.y + p.size * 2);
          ctx.stroke();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    stopWelcomeMelody();
    if (onToggleDontShowAgain) {
      onToggleDontShowAgain(true);
    }
    onClose();
  };

  const handleStartBrowsing = () => {
    stopWelcomeMelody();
    onSoundTrigger();
    handleCloseModal();
  };

  const storyPortals = [
    {
      id: 1,
      title: 'قصص الأميرات الساحرات',
      desc: 'سندريلا، رابونزل، سنو وايت وحكايات القصور الخيالية.',
      icon: Crown,
      color: 'from-pink-500 to-rose-500',
      badge: '👑 عالم الأميرات',
      glow: 'shadow-pink-500/20',
      border: 'border-pink-200 dark:border-pink-900/50',
    },
    {
      id: 2,
      title: 'مغامرات وأساطير الفضاء',
      desc: 'رحلات شيقة عبر الزمن، كوكب الحلوى، واختراعات مدهشة.',
      icon: Compass,
      color: 'from-amber-500 to-orange-500',
      badge: '🚀 مغامرات شيقة',
      glow: 'shadow-amber-500/20',
      border: 'border-amber-200 dark:border-amber-900/50',
    },
    {
      id: 3,
      title: 'حيوانات الغابة الذكية',
      desc: 'قصص بولت وحيوانات الغابة لغرس الشجاعة والوفاء.',
      icon: Heart,
      color: 'from-emerald-500 to-teal-500',
      badge: '🦁 بطولات وقيم',
      glow: 'shadow-emerald-500/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
    },
    {
      id: 4,
      title: 'حواديت ما قبل النوم',
      desc: 'أنغام مريحة وأجواء دافئة تساعد الأطفال على النوم الهادئ.',
      icon: Moon,
      color: 'from-indigo-500 to-violet-500',
      badge: '🌙 نوم هادئ',
      glow: 'shadow-indigo-500/20',
      border: 'border-indigo-200 dark:border-indigo-900/50',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="fantasy-welcome-title"
      aria-describedby="fantasy-welcome-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      {/* Cinematic Deep Twilight Backdrop with Ambient Falling Stars */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in overflow-hidden"
        onClick={handleCloseModal}
        aria-hidden="true"
      >
        {/* Full-screen Ambient Falling Stars */}
        <div className="absolute top-[10%] right-[15%] animate-shooting-star" style={{ animationDelay: '0.8s', animationDuration: '4.2s' }}>
          <div className="relative flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_20px_#f59e0b]" />
            <div className="h-[1px] w-28 bg-gradient-to-r from-white via-amber-300/60 to-transparent blur-[0.5px]" />
          </div>
        </div>

        <div className="absolute top-[35%] right-[70%] animate-shooting-star" style={{ animationDelay: '3.2s', animationDuration: '3.8s' }}>
          <div className="relative flex items-center">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_20px_#ec4899]" />
            <div className="h-[1.5px] w-36 bg-gradient-to-r from-white via-pink-400/60 to-transparent blur-[0.5px]" />
          </div>
        </div>

        <div className="absolute top-[60%] right-[25%] animate-shooting-star" style={{ animationDelay: '5.5s', animationDuration: '4.5s' }}>
          <div className="relative flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#fff,0_0_20px_#38bdf8]" />
            <div className="h-[1px] w-24 bg-gradient-to-r from-white via-sky-300/60 to-transparent blur-[0.5px]" />
          </div>
        </div>
      </div>

      {/* Main Magical Card Container */}
      <div className="relative w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-amber-200/50 dark:border-indigo-500/30 overflow-hidden z-10 my-auto text-slate-800 dark:text-slate-100 transition-all duration-300 transform scale-100 animate-in zoom-in-95">
        
        {/* Floating Interactive Canvas for Fairy Dust and Sparkles */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
        />

        {/* Floating Whimsical Fairy Glow Orbs in Background */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-400/20 via-pink-500/15 to-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-gradient-to-tr from-indigo-500/20 to-sky-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Enchanted Fairytale Banner with Generated Artwork & Interactive Falling Stars */}
        <div 
          onClick={handleBannerClick}
          className="relative h-44 sm:h-52 w-full overflow-hidden select-none cursor-pointer group/banner"
          title="المس السماء لإطلاق نجوم متساقطة وشهب سحرية! ✨"
        >
          <img
            src={fantasyBg}
            alt="عالم الحكايات الكرتونية الساحرة لقناة قصة العائلة"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform scale-105 hover:scale-110 transition-transform duration-1000 ease-out"
          />

          {/* Magical Vignette Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-slate-900 dark:via-slate-900/50 dark:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-transparent" />

          {/* Falling Stars (Lightweight div elements streaking across the sky) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20" aria-hidden="true">
            {FALLING_STARS.map((star) => (
              <div
                key={star.id}
                className="absolute animate-shooting-star"
                style={{
                  top: star.top,
                  right: star.right,
                  animationDelay: star.delay,
                  animationDuration: star.duration,
                }}
              >
                <div className="relative flex items-center">
                  {/* Glowing Shooting Star Head */}
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_16px_#f59e0b,0_0_24px_#f43f5e]" />
                  {/* Glowing Trailing Tail */}
                  <div className="h-[1.5px] sm:h-[2px] w-20 sm:w-32 bg-gradient-to-r from-white via-amber-300/80 to-transparent blur-[0.5px]" />
                </div>
              </div>
            ))}

            {/* Interactive User-Spawned Shooting Stars */}
            {interactiveStars.map((star) => (
              <div
                key={star.id}
                className="absolute animate-shooting-star pointer-events-none"
                style={{
                  left: star.x,
                  top: star.y,
                  animationDuration: '2.2s',
                }}
              >
                <div className="relative flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_#ffffff,0_0_22px_#f59e0b,0_0_32px_#ec4899]" />
                  <div className="h-[2.5px] w-28 sm:w-40 bg-gradient-to-r from-white via-amber-300 to-transparent blur-[0.5px]" />
                </div>
              </div>
            ))}
          </div>

          {/* Top Bar inside Banner: Official Fantasy Tag & Close Button */}
          <div className="relative z-30 flex items-center justify-between p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-twinkle shrink-0" aria-hidden="true" />
              <span>عالم الحكايات الكرتونية الساحرة</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal();
              }}
              aria-label="إغلاق الشاشة الترحيبية"
              className="w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-900/90 text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 active:scale-90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Floating Magic Wand / Stars Interactive Hint Cue */}
          <div className="absolute bottom-6 left-6 z-30 hidden sm:flex items-center gap-2 text-white/90 text-[11px] font-semibold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 animate-float">
            <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-twinkle" />
            <span>المس السماء لإطلاق نجوم متساقطة ✨</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="relative px-5 sm:px-8 pb-6 sm:pb-7 pt-0 z-30">
          
          {/* Logo with Multi-layer Pulsing Magical Aura Ring */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              
              {/* Magical Avatar Enclosure */}
              <div className="relative group shrink-0">
                {/* Rotating Conic Radiant Aura */}
                <div 
                  className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 blur-sm opacity-85 group-hover:opacity-100 transition duration-500 animate-spin-slow pointer-events-none" 
                  aria-hidden="true"
                />
                
                <div className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-2xl p-1 bg-white dark:bg-slate-900 shadow-2xl border-2 border-amber-300/80 dark:border-amber-400/50">
                  <img
                    src="/logo.jpg"
                    alt="شعار قناة قصة العائلة"
                    className="w-full h-full object-cover rounded-xl bg-slate-900"
                  />
                </div>

                {/* Verified Magic Checkmark */}
                <div
                  className="absolute -bottom-1 -left-1 bg-gradient-to-tr from-emerald-600 to-teal-400 text-white rounded-full p-1.5 shadow-lg border-2 border-white dark:border-slate-900 flex items-center justify-center animate-bounce-slow"
                  title="القناة الرسمية الموثقة"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>

              {/* Title & Channel Subtitle */}
              <div className="pb-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
                  <Stars className="w-3.5 h-3.5 animate-twinkle" />
                  <span>المنصة الرسمية المعتمدة للأطفال</span>
                </div>
                
                <h2
                  id="fantasy-welcome-title"
                  className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-['Baloo_Bhaijaan_2'] leading-tight mt-0.5"
                >
                  أهلاً بكم في عالم <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500">قصة العائلة</span>! ✨
                </h2>
                
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">{CHANNEL_HANDLE}</span>
                  <span aria-hidden="true">·</span>
                  <span>حكايات ورسوم متحركة كرتونية</span>
                </div>
              </div>

            </div>

            {/* Quick Live Counters (Unboxed Clean Typography) */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pb-2">
              <span className="font-bold text-amber-600 dark:text-amber-400">+100 حكاية</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">محتوى آمن 100%</span>
            </div>
          </div>

          {/* Description */}
          <p
            id="fantasy-welcome-desc"
            className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4 sm:mb-5"
          >
            نرحب بكم في بوابتكم العائلية لعالم الخيال والمغامرات الهادفة. تم تصميم الموقع ليمنح أطفالكم تجربة استكشاف ساحرة، تجمع بين أمتع الرسوم المتحركة والقصص التربوية في بيئة آمنة تماماً وخالية من أي إعلانات مزعجة.
          </p>

          {/* 4 Interactive Fantasy Story Portals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 sm:mb-6">
            {storyPortals.map((portal, idx) => {
              const IconComponent = portal.icon;
              const isActive = activeStoryPillar === idx;

              return (
                <div
                  key={portal.id}
                  onMouseEnter={() => setActiveStoryPillar(idx)}
                  onMouseLeave={() => setActiveStoryPillar(null)}
                  className={`relative p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border ${portal.border} shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default text-right ${
                    isActive ? 'ring-2 ring-amber-400/50' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${portal.color} text-white flex items-center justify-center mb-2 shadow-xs`}>
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                    {portal.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal font-medium line-clamp-2">
                    {portal.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            {/* Primary Action Button with Fantasy Glow & Shimmer */}
            <button
              ref={startButtonRef}
              type="button"
              onClick={handleStartBrowsing}
              className="group relative w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-700 hover:via-pink-700 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer overflow-hidden focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              {/* Shimmering Light Sweep Animation */}
              <span 
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" 
                aria-hidden="true"
              />

              <Play className="w-4 h-4 fill-white shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true" />
              <span className="relative z-10">ابدأ المغامرة الساحرة الآن</span>
              <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200 shrink-0 animate-twinkle" aria-hidden="true" />
            </button>

            {/* YouTube Official Channel Link with Glowing Aura */}
            <a
              href={OFFICIAL_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSoundTrigger}
              aria-label="زيارة قناة قصة العائلة الرسمية على يوتيوب"
              className="group w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-700 active:scale-98 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <div className="relative flex items-center justify-center shrink-0">
                <span
                  className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-red-600 blur-xs opacity-75 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 animate-pulse pointer-events-none"
                  aria-hidden="true"
                />
                <span className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-red-600 text-white shadow-xs">
                  <Youtube className="w-3.5 h-3.5 fill-white text-white shrink-0" aria-hidden="true" />
                </span>
              </div>
              <span>قناة YouTube الرسمية</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            </a>
          </div>

          {/* Discrete Skip Link */}
          <div className="mt-3.5 text-center">
            <button
              type="button"
              onClick={handleCloseModal}
              className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors py-1 cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <span>تخطي والمتابعة مباشرة إلى الصفحة الرئيسية</span>
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
