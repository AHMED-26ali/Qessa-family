import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Trophy, Star, ArrowRight, ArrowLeft, ArrowUp, Sparkles, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MagicForestRunnerProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

export const MagicForestRunner: React.FC<MagicForestRunnerProps> = ({ soundEnabled, onPlaySound }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [level, setLevel] = useState(1);
  const [isWon, setIsWon] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Active touch buttons state
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  const gameStateRef = useRef({
    player: {
      x: 50,
      y: 220,
      vx: 0,
      vy: 0,
      width: 32,
      height: 32,
      isGrounded: false,
    },
    stars: [] as { x: number; y: number; collected: boolean }[],
    mushrooms: [] as { x: number; y: number; width: number }[],
    castle: { x: 950, y: 160, width: 70, height: 90 },
    cameraX: 0,
    score: 0,
    starsCount: 0,
    animationId: 0,
  });

  // Setup level elements
  const initLevel = (lvl = 1) => {
    setLevel(lvl);
    setIsWon(false);
    setIsGameOver(false);
    setScore(0);
    setStarsCollected(0);

    const stars = [];
    const mushrooms = [];

    // Star spacing based on level
    const levelLength = 1000 + lvl * 200;
    for (let x = 120; x < levelLength - 100; x += 110) {
      stars.push({
        x: x + Math.random() * 30,
        y: 190 - Math.random() * 60,
        collected: false,
      });
    }

    // Harmless gentle mushrooms
    for (let x = 250; x < levelLength - 150; x += 220) {
      mushrooms.push({
        x: x + Math.random() * 40,
        y: 228,
        width: 24,
      });
    }

    gameStateRef.current = {
      player: {
        x: 50,
        y: 220,
        vx: 0,
        vy: 0,
        width: 32,
        height: 32,
        isGrounded: true,
      },
      stars,
      mushrooms,
      castle: { x: levelLength - 80, y: 160, width: 70, height: 90 },
      cameraX: 0,
      score: 0,
      starsCount: 0,
      animationId: 0,
    };
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = true;
      }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.jump = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = false;
      }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Game Loop on Canvas
  useEffect(() => {
    if (!isPlaying) return;

    initLevel(level);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const gameLoop = () => {
      if (!isMounted) return;

      const state = gameStateRef.current;
      const player = state.player;
      const keys = keysRef.current;

      // 1. Horizontal Physics
      if (keys.right) {
        player.vx = 4.2;
      } else if (keys.left) {
        player.vx = -4.2;
      } else {
        player.vx *= 0.8;
      }

      // 2. Jump Physics
      if (keys.jump && player.isGrounded) {
        player.vy = -8.5;
        player.isGrounded = false;
        if (soundEnabled && onPlaySound) onPlaySound();
      }

      // Gravity
      player.vy += 0.45;
      player.x += player.vx;
      player.y += player.vy;

      // Floor collision (ground at y = 220)
      if (player.y >= 220) {
        player.y = 220;
        player.vy = 0;
        player.isGrounded = true;
      }

      // Camera follows player smoothly
      state.cameraX = Math.max(0, player.x - 160);

      // Star collection
      state.stars.forEach((star) => {
        if (!star.collected) {
          const dx = player.x - star.x;
          const dy = player.y - star.y;
          if (Math.sqrt(dx * dx + dy * dy) < 28) {
            star.collected = true;
            state.score += 15;
            state.starsCount += 1;
            setScore(state.score);
            setStarsCollected(state.starsCount);
            if (soundEnabled && onPlaySound) onPlaySound();
          }
        }
      });

      // Harmless gentle mushroom collision
      state.mushrooms.forEach((m) => {
        const dx = player.x - m.x;
        const dy = player.y - m.y;
        if (Math.abs(dx) < 20 && Math.abs(dy) < 18) {
          // Bounce player back harmlessly
          player.vx = -3;
          player.vy = -5;
        }
      });

      // Castle Goal reached!
      if (player.x >= state.castle.x + 10) {
        setIsWon(true);
        setIsPlaying(false);
        try {
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}
        return;
      }

      // 3. Render Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#bae6fd');
      skyGrad.addColorStop(0.7, '#fef08a');
      skyGrad.addColorStop(1, '#86efac');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds (parallax)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(100 - state.cameraX * 0.2, 50, 25, 0, Math.PI * 2);
      ctx.arc(130 - state.cameraX * 0.2, 45, 32, 0, Math.PI * 2);
      ctx.arc(160 - state.cameraX * 0.2, 50, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(380 - state.cameraX * 0.2, 70, 25, 0, Math.PI * 2);
      ctx.arc(410 - state.cameraX * 0.2, 65, 30, 0, Math.PI * 2);
      ctx.arc(440 - state.cameraX * 0.2, 70, 25, 0, Math.PI * 2);
      ctx.fill();

      // Draw Green Hills
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, 250);
      for (let x = 0; x <= canvas.width; x += 40) {
        const hillY = 245 + Math.sin((x + state.cameraX) * 0.02) * 5;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // Ground Soil
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 250, canvas.width, canvas.height - 250);

      ctx.save();
      ctx.translate(-state.cameraX, 0);

      // Draw Stars
      state.stars.forEach((star) => {
        if (!star.collected) {
          ctx.font = '20px sans-serif';
          ctx.fillText('⭐', star.x - 10, star.y + 8);
        }
      });

      // Draw Mushrooms
      state.mushrooms.forEach((m) => {
        ctx.font = '22px sans-serif';
        ctx.fillText('🍄', m.x - 11, m.y + 20);
      });

      // Draw Castle at the End
      const c = state.castle;
      ctx.font = '48px sans-serif';
      ctx.fillText('🏰', c.x, c.y + 60);

      // Draw Cute Fox Character
      ctx.font = '32px sans-serif';
      ctx.fillText('🦊', player.x - 16, player.y + 28);

      ctx.restore();

      state.animationId = requestAnimationFrame(gameLoop);
    };

    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);

    return () => {
      isMounted = false;
      cancelAnimationFrame(gameStateRef.current.animationId);
    };
  }, [isPlaying, level]);

  const handleStart = () => {
    setIsPlaying(true);
    initLevel(level);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-3 sm:p-5 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl sm:rounded-3xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-lg text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md text-xl">
            🌳
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-emerald-200">
              مغامرة الغابة السحرية
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              ساعد الثعلب فرفور في جمع النجوم والوصول لقصر الحكايات!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-2xs">
            النجوم: ⭐ {starsCollected}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-500 text-white shadow-2xs">
            المستوى {level}
          </span>
        </div>
      </div>

      {/* Canvas Screen */}
      <div className="relative w-full aspect-[16/10] max-w-lg rounded-2xl overflow-hidden bg-sky-100 border-2 border-emerald-400 dark:border-slate-700 shadow-xl">
        <canvas
          ref={canvasRef}
          width={500}
          height={300}
          className="w-full h-full block"
        />

        {/* Start Overlay */}
        {!isPlaying && !isWon && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 p-4 text-center">
            <span className="text-4xl animate-bounce-slow">🦊⭐🏰</span>
            <h4 className="text-white font-black text-base sm:text-lg">
              جاهز لمغامرة الغابة السحرية؟
            </h4>
            <p className="text-amber-200 text-xs font-bold max-w-xs">
              استخدم أزرار الحركة أو لوحة المفاتيح (الأسهم والمسافة) للقفز وجمع النجوم!
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl active:scale-95 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ابدأ المغامرة الآن ▶</span>
            </button>
          </div>
        )}

        {/* Victory Overlay */}
        {isWon && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 p-4 text-center text-white">
            <Trophy className="w-12 h-12 fill-yellow-300 animate-spin-slow" />
            <h4 className="text-lg font-black">وصلت إلى قصر الحكايات بسلام! 🏰🎉</h4>
            <p className="text-xs font-bold text-amber-200">
              جمعت {starsCollected} نجمة وحققت {score} نقطة!
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  initLevel(level + 1);
                  setIsPlaying(true);
                }}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                المستوى التالي ➔
              </button>
              <button
                type="button"
                onClick={() => {
                  initLevel(level);
                  setIsPlaying(true);
                }}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition cursor-pointer"
              >
                إعادة المستوى ↺
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch On-Screen Controls for Mobile / Tablets */}
      <div className="flex items-center justify-between w-full max-w-lg mt-3 px-2">
        {/* Left & Right D-Pad */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => {
              keysRef.current.right = true;
            }}
            onPointerUp={() => {
              keysRef.current.right = false;
            }}
            onPointerLeave={() => {
              keysRef.current.right = false;
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-700 text-slate-800 dark:text-slate-100 flex items-center justify-center shadow-md active:scale-90 select-none cursor-pointer"
            title="تحرك لليمين"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <button
            type="button"
            onPointerDown={() => {
              keysRef.current.left = true;
            }}
            onPointerUp={() => {
              keysRef.current.left = false;
            }}
            onPointerLeave={() => {
              keysRef.current.left = false;
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-700 text-slate-800 dark:text-slate-100 flex items-center justify-center shadow-md active:scale-90 select-none cursor-pointer"
            title="تحرك لليسار"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Big Jump Button */}
        <button
          type="button"
          onPointerDown={() => {
            keysRef.current.jump = true;
          }}
          onPointerUp={() => {
            keysRef.current.jump = false;
          }}
          onPointerLeave={() => {
            keysRef.current.jump = false;
          }}
          className="px-6 h-12 sm:h-14 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg active:scale-90 select-none cursor-pointer border-2 border-white/60"
          title="قفز"
        >
          <ArrowUp className="w-6 h-6" />
          <span>قفز ⬆</span>
        </button>
      </div>

      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center font-medium">
        💡 يمكنك التحكم بأسهم لوحة المفاتيح والمسافة أو عبر أزرار اللمس أعلاه
      </p>
    </div>
  );
};
