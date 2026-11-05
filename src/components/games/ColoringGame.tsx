import React, { useState, useRef } from 'react';
import { Download, RotateCcw, Undo2, Eraser, Sparkles, Check, Palette } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ColoringGameProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

interface DrawingScene {
  id: string;
  title: string;
  emoji: string;
  parts: { id: string; nameAr: string; d: string; defaultColor?: string }[];
}

const PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#78350f', // Brown
  '#64748b', // Slate
  '#0f172a', // Midnight
  '#ffffff', // White
];

const SCENES: DrawingScene[] = [
  {
    id: 'fox',
    title: 'الثعلب مكرون وشجرة التفاح',
    emoji: '🦊',
    parts: [
      // Sky background
      { id: 'sky', nameAr: 'السماء', d: 'M 0 0 L 400 0 L 400 200 L 0 200 Z' },
      // Ground hill
      { id: 'ground', nameAr: 'التلة العشبية', d: 'M 0 190 Q 150 160 250 200 Q 320 220 400 180 L 400 300 L 0 300 Z' },
      // Sun
      { id: 'sun', nameAr: 'قرص الشمس', d: 'M 70 60 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0' },
      // Tree Trunk
      { id: 'trunk', nameAr: 'جذع الشجرة', d: 'M 290 140 L 325 140 L 330 250 L 285 250 Z' },
      // Tree Leaves
      { id: 'leaves1', nameAr: 'أوراق الشجرة 1', d: 'M 270 110 m -40 0 a 40 40 0 1 0 80 0 a 40 40 0 1 0 -80 0' },
      { id: 'leaves2', nameAr: 'أوراق الشجرة 2', d: 'M 330 95 m -45 0 a 45 45 0 1 0 90 0 a 45 45 0 1 0 -90 0' },
      // Apples
      { id: 'apple1', nameAr: 'تفاحة 1', d: 'M 260 90 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0' },
      { id: 'apple2', nameAr: 'تفاحة 2', d: 'M 320 80 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0' },
      { id: 'apple3', nameAr: 'تفاحة 3', d: 'M 350 120 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0' },
      // Fox Body
      { id: 'fox_body', nameAr: 'جسم الثعلب', d: 'M 140 200 C 120 200 110 240 140 250 C 170 250 180 200 140 200 Z' },
      // Fox Tail
      { id: 'fox_tail', nameAr: 'ذيل الثعلب', d: 'M 115 235 Q 80 230 75 200 Q 100 210 120 225 Z' },
      // Fox Head
      { id: 'fox_head', nameAr: 'رأس الثعلب', d: 'M 140 175 m -22 0 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0' },
      // Ears
      { id: 'fox_ear_l', nameAr: 'أذن يسرى', d: 'M 125 155 L 115 135 L 132 145 Z' },
      { id: 'fox_ear_r', nameAr: 'أذن يمنى', d: 'M 155 155 L 165 135 L 148 145 Z' },
      // Face Mask
      { id: 'fox_mask', nameAr: 'خدود الثعلب', d: 'M 125 180 Q 140 195 155 180 Q 140 170 125 180 Z' },
    ],
  },
  {
    id: 'castle',
    title: 'قصر الأميرات والتاج السحري',
    emoji: '🏰',
    parts: [
      { id: 'castle_sky', nameAr: 'السماء الوردية', d: 'M 0 0 L 400 0 L 400 230 L 0 230 Z' },
      { id: 'castle_ground', nameAr: 'حديقة القصر', d: 'M 0 230 L 400 230 L 400 300 L 0 300 Z' },
      { id: 'tower_left', nameAr: 'البرج الأيسر', d: 'M 80 90 L 130 90 L 130 230 L 80 230 Z' },
      { id: 'roof_left', nameAr: 'سقف البرج الأيسر', d: 'M 75 90 L 105 35 L 135 90 Z' },
      { id: 'tower_right', nameAr: 'البرج الأيمن', d: 'M 270 90 L 320 90 L 320 230 L 270 230 Z' },
      { id: 'roof_right', nameAr: 'سقف البرج الأيمن', d: 'M 265 90 L 295 35 L 325 90 Z' },
      { id: 'tower_center', nameAr: 'البرج الكبير', d: 'M 150 70 L 250 70 L 250 230 L 150 230 Z' },
      { id: 'roof_center', nameAr: 'سقف القصر الرئيسي', d: 'M 145 70 L 200 15 L 255 70 Z' },
      { id: 'door', nameAr: 'بوابة القصر', d: 'M 180 230 L 180 180 Q 200 160 220 180 L 220 230 Z' },
      { id: 'window1', nameAr: 'نافذة البرج 1', d: 'M 98 120 Q 105 110 112 120 L 112 145 L 98 145 Z' },
      { id: 'window2', nameAr: 'نافذة البرج 2', d: 'M 288 120 Q 295 110 302 120 L 302 145 L 288 145 Z' },
      { id: 'crown_base', nameAr: 'قاعدة التاج', d: 'M 175 140 L 225 140 L 220 150 L 180 150 Z' },
      { id: 'crown_spikes', nameAr: 'رؤوس التاج', d: 'M 175 140 L 170 120 L 188 132 L 200 115 L 212 132 L 230 120 L 225 140 Z' },
    ],
  },
  {
    id: 'ship',
    title: 'سفينة السندباد والمحيط',
    emoji: '⛵',
    parts: [
      { id: 'ocean_sky', nameAr: 'السماء الزرقاء', d: 'M 0 0 L 400 0 L 400 180 L 0 180 Z' },
      { id: 'sea_water', nameAr: 'أمواج البحر', d: 'M 0 180 Q 100 170 200 190 Q 300 170 400 190 L 400 300 L 0 300 Z' },
      { id: 'sun_sea', nameAr: 'الشمس المشرقة', d: 'M 330 60 m -25 0 a 25 25 0 1 0 50 0 a 25 25 0 1 0 -50 0' },
      { id: 'boat_hull', nameAr: 'هيكل السفينة', d: 'M 120 170 L 280 170 Q 260 220 190 220 Q 140 220 120 170 Z' },
      { id: 'mast', nameAr: 'سارية السفينة', d: 'M 195 70 L 205 70 L 205 170 L 195 170 Z' },
      { id: 'sail_left', nameAr: 'الشراع الأيسر', d: 'M 195 80 L 140 150 L 195 150 Z' },
      { id: 'sail_right', nameAr: 'الشراع الأيمن', d: 'M 205 75 L 260 145 L 205 145 Z' },
      { id: 'flag_ship', nameAr: 'علم السفينة', d: 'M 205 70 L 235 60 L 205 50 Z' },
      { id: 'star1', nameAr: 'نجمة البحر 1', d: 'M 70 70 m -10 0 a 10 10 0 1 0 20 0 a 10 10 0 1 0 -20 0' },
      { id: 'star2', nameAr: 'نجمة البحر 2', d: 'M 110 50 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0' },
    ],
  },
];

export const ColoringGame: React.FC<ColoringGameProps> = ({ soundEnabled, onPlaySound }) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('#f97316');
  const [isEraser, setIsEraser] = useState(false);
  const [filledColors, setFilledColors] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, string>[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const scene = SCENES[sceneIdx];

  const handleSceneChange = (idx: number) => {
    setSceneIdx(idx);
    setFilledColors({});
    setHistory([]);
    setIsSaved(false);
  };

  const handlePartClick = (partId: string) => {
    if (soundEnabled && onPlaySound) onPlaySound();

    const colorToApply = isEraser ? '#ffffff' : selectedColor;
    setHistory((prev) => [...prev, { ...filledColors }]);
    setFilledColors((prev) => ({
      ...prev,
      [partId]: colorToApply,
    }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setFilledColors(previous);
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  const handleReset = () => {
    setFilledColors({});
    setHistory([]);
    setIsSaved(false);
  };

  // Export & Download drawing locally to child's device
  const handleSaveToDevice = () => {
    if (!svgRef.current) return;

    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // White background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Add fun signature
        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 24px Cairo, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('لوحتي الفنية من موقع قصة العائلة 🎨⭐', canvas.width - 30, canvas.height - 25);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `رسمتي_${scene.title.replace(/\s+/g, '_')}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);

        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {}
      };
      image.src = blobURL;
    } catch (e) {
      console.error('Failed to download image locally:', e);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-3 sm:p-5 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-slate-900 dark:to-indigo-950 rounded-2xl sm:rounded-3xl border border-amber-200/80 dark:border-indigo-900/60 shadow-lg text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center font-black shadow-md text-xl">
            🎨
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-pink-200">
              كتاب تلوين الحكايات
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              اختر لوناً واضغط على أجزاء الرسمة لتلوينها!
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-40 transition shadow-2xs cursor-pointer"
            title="تراجع"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تراجع</span>
          </button>
          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer ${
              isEraser ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
            title="ممحاة"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>ممحاة</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="مسح الكل"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSaveToDevice}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95 transition cursor-pointer"
            title="حفظ الصورة على جهازي"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'تم الحفظ! ✓' : 'حفظ الرسمة 💾'}</span>
          </button>
        </div>
      </div>

      {/* Scene Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3 w-full">
        {SCENES.map((sc, idx) => (
          <button
            key={sc.id}
            type="button"
            onClick={() => handleSceneChange(idx)}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              sceneIdx === idx
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <span>{sc.emoji}</span>
            <span>{sc.title}</span>
          </button>
        ))}
      </div>

      {/* Color Palette (Touch Friendly with 36px buttons) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3 p-2 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-inner max-w-lg">
        {PALETTE.map((color) => {
          const isSelected = selectedColor === color && !isEraser;
          return (
            <button
              key={color}
              type="button"
              onClick={() => {
                setSelectedColor(color);
                setIsEraser(false);
              }}
              style={{ backgroundColor: color }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-transform duration-200 cursor-pointer shadow-xs ${
                isSelected
                  ? 'border-slate-900 dark:border-white scale-125 ring-2 ring-amber-400 z-10'
                  : 'border-white/80 hover:scale-110 active:scale-95'
              }`}
              title={`لون: ${color}`}
            />
          );
        })}
      </div>

      {/* SVG Canvas Board */}
      <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden bg-white border-2 border-slate-300 dark:border-slate-700 shadow-xl cursor-pointer">
        <svg
          ref={svgRef}
          viewBox="0 0 400 300"
          className="w-full h-full select-none"
        >
          {scene.parts.map((part) => {
            const fillColor = filledColors[part.id] || part.defaultColor || '#ffffff';
            return (
              <path
                key={part.id}
                d={part.d}
                fill={fillColor}
                stroke="#1e293b"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                onClick={() => handlePartClick(part.id)}
                className="transition-colors duration-150 hover:opacity-90"
              />
            );
          })}
        </svg>

        {isEraser && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-black shadow-md flex items-center gap-1 pointer-events-none">
            <Eraser className="w-3 h-3" />
            <span>وضع الممحاة نشط</span>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center">
        💡 يمكنك حفظ رسمتك الجميلة على جهازك مجاناً عبر زر «حفظ الرسمة 💾»
      </p>
    </div>
  );
};
