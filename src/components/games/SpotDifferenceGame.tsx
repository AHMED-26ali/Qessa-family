import React, { useState } from 'react';
import { Lightbulb, RotateCcw, Trophy, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SpotDifferenceGameProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

interface DifferenceItem {
  id: string;
  nameAr: string;
  // Normalized percentage coordinates (0 - 100)
  x: number;
  y: number;
  radius: number;
  hint: string;
}

interface StageData {
  id: string;
  title: string;
  emoji: string;
  description: string;
  differences: DifferenceItem[];
  // SVG drawing configuration for Scene A & Scene B
  renderScene: (isVariantB: boolean, foundIds: string[]) => React.ReactNode;
}

const STAGES: StageData[] = [
  {
    id: 'forest',
    title: 'الغابة السحرية والأصدقاء',
    emoji: '🌳',
    description: 'ابحث عن ٥ اختلافات بين الصورتين في بيت الثعلب مكرون!',
    differences: [
      { id: 'sun', nameAr: 'نظارة الشمس', x: 20, y: 18, radius: 10, hint: 'انظر إلى قرص الشمس في السماء!' },
      { id: 'apple', nameAr: 'التفاحة على الشجرة', x: 75, y: 35, radius: 10, hint: 'انظر إلى أغصان شجرة التفاح!' },
      { id: 'butterfly', nameAr: 'فراشة زرقاء', x: 48, y: 30, radius: 9, hint: 'فراشة لطيفة تطير فوق الأزهار!' },
      { id: 'fox_hat', nameAr: 'قبعة الثعلب', x: 38, y: 65, radius: 10, hint: 'رأس الثعلب مكرون يرتدي شيئاً!' },
      { id: 'flower', nameAr: 'زهرة عباد الشمس', x: 80, y: 80, radius: 9, hint: 'زهرة صفراء جميلة أسفل اليمين!' },
    ],
    renderScene: (isVariantB, foundIds) => (
      <svg viewBox="0 0 400 300" className="w-full h-full rounded-2xl select-none">
        {/* Background Sky & Hills */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        <rect width="400" height="300" fill="url(#skyGrad)" />

        {/* Sun (Difference 1: has cool sunglasses in B) */}
        <g transform="translate(80, 55)">
          <circle r="32" fill="#facc15" stroke="#f59e0b" strokeWidth="3" />
          {/* Eyes */}
          <circle cx="-10" cy="-4" r="3.5" fill="#1e293b" />
          <circle cx="10" cy="-4" r="3.5" fill="#1e293b" />
          <path d="M -8 10 Q 0 18 8 10" stroke="#b45309" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Difference: Sunglasses */}
          {isVariantB && (
            <g transform="translate(0, -4)">
              <rect x="-18" y="-5" width="15" height="10" rx="3" fill="#0f172a" />
              <rect x="3" y="-5" width="15" height="10" rx="3" fill="#0f172a" />
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#0f172a" strokeWidth="2.5" />
            </g>
          )}
        </g>

        {/* Clouds */}
        <path d="M 220 50 Q 240 30 260 50 Q 280 40 295 55 Q 310 70 290 80 L 220 80 Z" fill="#ffffff" opacity="0.9" />

        {/* Rolling Hills */}
        <path d="M 0 200 Q 120 150 250 210 Q 340 240 400 190 L 400 300 L 0 300 Z" fill="url(#hillGrad)" />

        {/* Tree on the Right */}
        <rect x="290" y="140" width="30" height="110" fill="#78350f" rx="6" />
        <circle cx="305" cy="120" r="55" fill="#15803d" />
        <circle cx="280" cy="110" r="40" fill="#16a34a" />
        <circle cx="330" cy="115" r="42" fill="#22c55e" />

        {/* Apple (Difference 2: Red apple present in B, missing in A) */}
        {isVariantB ? (
          <g transform="translate(300, 105)">
            <circle r="12" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M 0 -12 Q 4 -18 8 -16" stroke="#15803d" strokeWidth="2" fill="none" />
            <ellipse cx="-3" cy="-4" rx="2.5" ry="1.5" fill="#fca5a5" />
          </g>
        ) : (
          <circle cx="300" cy="105" r="7" fill="#16a34a" />
        )}

        {/* Butterfly (Difference 3: Flying in B, missing in A) */}
        {isVariantB && (
          <g transform="translate(190, 90)">
            <ellipse cx="-6" cy="0" rx="8" ry="6" fill="#38bdf8" />
            <ellipse cx="6" cy="0" rx="8" ry="6" fill="#38bdf8" />
            <line x1="0" y1="-6" x2="0" y2="6" stroke="#0284c7" strokeWidth="2" />
          </g>
        )}

        {/* Fox in Foreground */}
        <g transform="translate(150, 195)">
          {/* Tail */}
          <path d="M -30 25 Q -60 10 -50 -10 Q -40 5 -20 15 Z" fill="#ea580c" />
          <circle cx="-50" cy="-5" r="7" fill="#ffffff" />
          {/* Body */}
          <ellipse cx="0" cy="20" rx="28" ry="24" fill="#f97316" />
          <ellipse cx="0" cy="22" rx="16" ry="16" fill="#fff7ed" />
          {/* Head */}
          <circle cx="0" cy="-5" r="22" fill="#ea580c" />
          <polygon points="-16,-20 -8,-36 0,-20" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
          <polygon points="16,-20 8,-36 0,-20" fill="#ea580c" stroke="#c2410c" strokeWidth="1.5" />
          {/* Face */}
          <ellipse cx="-8" cy="-5" rx="3" ry="4" fill="#0f172a" />
          <ellipse cx="8" cy="-5" rx="3" ry="4" fill="#0f172a" />
          <polygon points="-5,5 5,5 0,10" fill="#0f172a" />
          {/* Difference 4: Party Hat in B */}
          {isVariantB && (
            <polygon points="-10,-24 0,-44 10,-24" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
          )}
        </g>

        {/* Flowers in Grass */}
        <circle cx="70" cy="260" r="8" fill="#f43f5e" />
        <circle cx="110" cy="275" r="7" fill="#fbbf24" />

        {/* Difference 5: Big Sunflower in B */}
        {isVariantB ? (
          <g transform="translate(320, 240)">
            <circle r="12" fill="#f59e0b" />
            <circle r="7" fill="#78350f" />
            <line x1="0" y1="12" x2="0" y2="40" stroke="#15803d" strokeWidth="3" />
          </g>
        ) : (
          <circle cx="320" cy="255" r="6" fill="#a855f7" />
        )}
      </svg>
    ),
  },
  {
    id: 'castle',
    title: 'قصر الأميرات الخيالي',
    emoji: '🏰',
    description: 'ابحث عن ٥ اختلافات حول القصر الملكي والأميرة!',
    differences: [
      { id: 'flag', nameAr: 'علم البرج الوردي', x: 50, y: 15, radius: 10, hint: 'أعلى برج في القصر يحمل علماً!' },
      { id: 'cat', nameAr: 'القطة البيضاء', x: 22, y: 78, radius: 10, hint: 'حيوان أليف لطيف يجلس في الحديقة!' },
      { id: 'rainbow', nameAr: 'قوس قزح', x: 20, y: 25, radius: 12, hint: 'انظر في سماء القصر من جهة اليسار!' },
      { id: 'rose', nameAr: 'باقة الورد', x: 78, y: 72, radius: 10, hint: 'بجانب مدخل القصر باقة زهور جميلة!' },
      { id: 'tiara', nameAr: 'التاج المرصع', x: 52, y: 62, radius: 9, hint: 'فوق رأس الأميرة تاج ذهبي!' },
    ],
    renderScene: (isVariantB, foundIds) => (
      <svg viewBox="0 0 400 300" className="w-full h-full rounded-2xl select-none">
        <defs>
          <linearGradient id="castleSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#castleSky)" />

        {/* Rainbow (Difference 1: In B) */}
        {isVariantB && (
          <g transform="translate(80, 80)">
            <path d="M -60 20 A 70 70 0 0 1 60 20" stroke="#ef4444" strokeWidth="4" fill="none" opacity="0.8" />
            <path d="M -56 20 A 66 66 0 0 1 56 20" stroke="#f59e0b" strokeWidth="4" fill="none" opacity="0.8" />
            <path d="M -52 20 A 62 62 0 0 1 52 20" stroke="#10b981" strokeWidth="4" fill="none" opacity="0.8" />
            <path d="M -48 20 A 58 58 0 0 1 48 20" stroke="#3b82f6" strokeWidth="4" fill="none" opacity="0.8" />
          </g>
        )}

        {/* Castle Base & Towers */}
        <rect x="120" y="110" width="160" height="150" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        {/* Left Tower */}
        <rect x="90" y="80" width="45" height="180" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        <polygon points="85,80 112,30 140,80" fill="#ec4899" />
        {/* Right Tower */}
        <rect x="265" y="80" width="45" height="180" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
        <polygon points="260,80 287,30 315,80" fill="#ec4899" />
        {/* Central High Tower */}
        <rect x="175" y="60" width="50" height="90" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        <polygon points="170,60 200,10 230,60" fill="#f43f5e" />

        {/* Flag (Difference 2: Pink flag in B, missing in A) */}
        {isVariantB && (
          <g transform="translate(200, 10)">
            <line x1="0" y1="0" x2="0" y2="-22" stroke="#475569" strokeWidth="2" />
            <polygon points="0,-22 20,-14 0,-6" fill="#f43f5e" />
          </g>
        )}

        {/* Castle Door */}
        <path d="M 180 260 L 180 200 Q 200 180 220 200 L 220 260 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />

        {/* Princess standing near door */}
        <g transform="translate(205, 195)">
          {/* Dress */}
          <polygon points="0,-5 -22,45 22,45" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
          {/* Head */}
          <circle cx="0" cy="-15" r="10" fill="#fed7aa" />
          {/* Hair */}
          <path d="M -10 -20 Q 0 -28 10 -20 L 12 -5 Q 0 0 -12 -5 Z" fill="#f59e0b" />
          {/* Tiara (Difference 3: Tiara in B) */}
          {isVariantB && (
            <polygon points="-8,-24 0,-32 8,-24 -4,-22" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          )}
        </g>

        {/* White Cat (Difference 4: In B) */}
        {isVariantB && (
          <g transform="translate(90, 235)">
            <ellipse cx="0" cy="0" rx="12" ry="9" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="7" cy="-7" r="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="4,-14 7,-10 10,-14" fill="#f472b6" />
          </g>
        )}

        {/* Rose Bush (Difference 5: Red roses in B, plain bush in A) */}
        {isVariantB ? (
          <g transform="translate(310, 215)">
            <circle cx="0" cy="0" r="18" fill="#15803d" />
            <circle cx="-5" cy="-5" r="5" fill="#ef4444" />
            <circle cx="6" cy="-2" r="5" fill="#ef4444" />
            <circle cx="0" cy="6" r="5" fill="#ef4444" />
          </g>
        ) : (
          <circle cx="310" cy="215" r="15" fill="#15803d" />
        )}
      </svg>
    ),
  },
];

export const SpotDifferenceGame: React.FC<SpotDifferenceGameProps> = ({
  soundEnabled,
  onPlaySound,
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [foundIds, setFoundIds] = useState<string[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);

  const stage = STAGES[currentStageIdx];
  const remainingCount = stage.differences.length - foundIds.length;

  const handleStageSelect = (idx: number) => {
    setCurrentStageIdx(idx);
    setFoundIds([]);
    setHintMessage(null);
    setIsWon(false);
  };

  const handleSpotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isWon) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if clicked near any unfound difference
    for (const diff of stage.differences) {
      if (foundIds.includes(diff.id)) continue;

      const dist = Math.sqrt(Math.pow(clickX - diff.x, 2) + Math.pow(clickY - diff.y, 2));
      if (dist <= diff.radius) {
        // Found!
        if (soundEnabled && onPlaySound) onPlaySound();
        const nextFound = [...foundIds, diff.id];
        setFoundIds(nextFound);
        setHintMessage(`رائع! وجدت: ${diff.nameAr} 🎉`);

        if (nextFound.length === stage.differences.length) {
          setIsWon(true);
          try {
            confetti({
              particleCount: 70,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {}
        }
        return;
      }
    }
  };

  const giveHint = () => {
    const unfound = stage.differences.filter((d) => !foundIds.includes(d.id));
    if (unfound.length > 0) {
      setHintMessage(`💡 تلميح: ${unfound[0].hint}`);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-3 sm:p-5 bg-gradient-to-br from-amber-50 to-pink-50 dark:from-slate-900 dark:to-indigo-950 rounded-2xl sm:rounded-3xl border border-amber-200/80 dark:border-indigo-900/60 shadow-lg text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
            🔍
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-200">
              لعبة اكتشف الاختلافات
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Counter & Hint */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-rose-500 text-white shadow-2xs">
            باقي: {remainingCount} من {stage.differences.length}
          </span>
          <button
            type="button"
            onClick={giveHint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-2xs transition cursor-pointer"
            title="طلب تلميح"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>تلميح</span>
          </button>
          <button
            type="button"
            onClick={() => handleStageSelect(currentStageIdx)}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            title="إعادة المرحلة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stage Selector */}
      <div className="flex items-center justify-center gap-2 mb-3">
        {STAGES.map((st, idx) => (
          <button
            key={st.id}
            type="button"
            onClick={() => handleStageSelect(idx)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              currentStageIdx === idx
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <span>{st.emoji}</span>
            <span>{st.title}</span>
          </button>
        ))}
      </div>

      {/* Hint Alert */}
      {hintMessage && (
        <div className="w-full mb-3 p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold text-center animate-twinkle">
          {hintMessage}
        </div>
      )}

      {/* Two Images Side-by-Side (Desktop) or Stacked (Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full my-2">
        
        {/* Image A (Original) */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black mb-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            الصورة الأولى (الأصلية) 🖼️
          </span>
          <div
            onClick={handleSpotClick}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-300 dark:border-slate-700 shadow-md cursor-crosshair bg-slate-900"
          >
            {stage.renderScene(false, foundIds)}

            {/* Found rings overlay */}
            {stage.differences
              .filter((d) => foundIds.includes(d.id))
              .map((d) => (
                <div
                  key={d.id}
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    width: `${d.radius * 2}%`,
                    height: `${d.radius * 2.5}%`,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-emerald-400 bg-emerald-400/20 shadow-lg animate-ping-slow pointer-events-none flex items-center justify-center"
                >
                  <span className="text-xs">✓</span>
                </div>
              ))}
          </div>
        </div>

        {/* Image B (Variant with differences) */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-black mb-1 px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            الصورة الثانية (المعدلة - اضغط هنا للاختلاف) ✨
          </span>
          <div
            onClick={handleSpotClick}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-rose-300 dark:border-slate-700 shadow-md cursor-crosshair bg-slate-900"
          >
            {stage.renderScene(true, foundIds)}

            {/* Found rings overlay */}
            {stage.differences
              .filter((d) => foundIds.includes(d.id))
              .map((d) => (
                <div
                  key={d.id}
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    width: `${d.radius * 2}%`,
                    height: `${d.radius * 2.5}%`,
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-3 border-emerald-400 bg-emerald-400/30 shadow-lg animate-ping-slow pointer-events-none flex items-center justify-center text-white font-black"
                >
                  <span className="text-xs bg-emerald-500 rounded-full px-1">✓</span>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* Victory Alert */}
      {isWon && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex flex-col items-center gap-2 text-center shadow-xl animate-bounce-slow w-full">
          <Trophy className="w-10 h-10 fill-amber-200 animate-spin-slow" />
          <h4 className="text-lg font-black">عبقري وقوي الملاحظة! 🌟</h4>
          <p className="text-xs font-bold">
            اكتشفت جميع الاختلافات الـ ٥ بنجاح في «{stage.title}»!
          </p>
          <button
            type="button"
            onClick={() => handleStageSelect((currentStageIdx + 1) % STAGES.length)}
            className="mt-2 px-5 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-emerald-100 transition shadow-md active:scale-95 cursor-pointer"
          >
            المرحلة التالية ➔
          </button>
        </div>
      )}
    </div>
  );
};
