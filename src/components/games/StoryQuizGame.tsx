import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, RotateCcw, Trophy, Star, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoryQuizGameProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

interface QuizQuestion {
  id: number;
  storyTitle: string;
  storyEmoji: string;
  question: string;
  options: { text: string; emoji: string; isCorrect: boolean }[];
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    storyTitle: 'الثعلب مكرون وكذبة التفاحة',
    storyEmoji: '🦊',
    question: 'ما هو التصرف الصحيح الذي يجب أن نفعله إذا أخطأنا في حق صديقنا؟',
    options: [
      { text: 'نختلق كذبة جديدة لنخفي الخطأ', emoji: '❌', isCorrect: false },
      { text: 'نعترف بالخطأ ونعتذر بصدق ونصلحه', emoji: '🌟', isCorrect: true },
      { text: 'نهرب ولا نتحدث معه ثانية', emoji: '🏃', isCorrect: false },
    ],
    explanation: 'الصدق والأمانة يجلبان محبة الأصدقاء، والاعتراف بالخطأ فضيلة!',
  },
  {
    id: 2,
    storyTitle: 'الكلب بولت والقوى الخارقة',
    storyEmoji: '🐶',
    question: 'ما هي القوة الحقيقية التي اكتشفها الكلب بولت في نهاية رحلته؟',
    options: [
      { text: 'قوة أشعة الليزر الخارقة', emoji: '⚡', isCorrect: false },
      { text: 'قوة الصداقة الحقيقية والوفاء للأصدقاء', emoji: '💖', isCorrect: true },
      { text: 'سرعة الجري الفائقة فقط', emoji: '💨', isCorrect: false },
    ],
    explanation: 'الشجاعة والوفاء للأصدقاء أعظم من أي قوة خارقة!',
  },
  {
    id: 3,
    storyTitle: 'قصة بياض الثلج (سنو وايت)',
    storyEmoji: '🍎',
    question: 'كيف تعاملت سنو وايت مع الأقزام السبعة في بيتهم الدافئ؟',
    options: [
      { text: 'ساعدتهم بتنظيف البيت والتعاون والمحبة', emoji: '🧹', isCorrect: true },
      { text: 'جلست دون أن تساعد أحد', emoji: '🛋️', isCorrect: false },
      { text: 'أخذت ألعابهم دون استئذان', emoji: '🚫', isCorrect: false },
    ],
    explanation: 'التعاون والمشاركة ونظافة البيت تنشر البهجة والمحبة بين الجميع!',
  },
  {
    id: 4,
    storyTitle: 'راعي الغنم وأهمية الصدق',
    storyEmoji: '🐑',
    question: 'لماذا لم يأتِ أهل القرية لمساعدة الراعي عندما ظهر الذئب فعلاً؟',
    options: [
      { text: 'لأنهم لم يسمعوا صوته', emoji: '👂', isCorrect: false },
      { text: 'لأنه كذب عليهم في المرات السابقة وفقد ثقتهم', emoji: '💔', isCorrect: true },
      { text: 'لأنهم كانوا نائمين', emoji: '😴', isCorrect: false },
    ],
    explanation: 'الصدق منجاة، والكذب يفقد صاحبه ثقة الناس ومساعدتهم في وقت الحاجة.',
  },
  {
    id: 5,
    storyTitle: 'السندباد البحري وجزيرة الحوت',
    storyEmoji: '⛵',
    question: 'ما الذي ساعد السندباد وبحارته في النجاة من مفاجآت البحر العجيبة؟',
    options: [
      { text: 'الخوف والارتباك الشديد', emoji: '😱', isCorrect: false },
      { text: 'اليقظة وسرعة البديهة والهدوء والتعاون', emoji: '🧭', isCorrect: true },
      { text: 'القفز في الماء دون تفكير', emoji: '🌊', isCorrect: false },
    ],
    explanation: 'التفكير الهادئ وسرعة التصرف يساعداننا في حل أي مشكلة تواجهنا.',
  },
  {
    id: 6,
    storyTitle: 'فأر المدينة وفأر الريف',
    storyEmoji: '🐭',
    question: 'ما هو الدرس الجميل الذي تعلمه الفأران في المقارنة بين حياتهما؟',
    options: [
      { text: 'القناعة وراحة البال في البساطة أفضل من ثراء محفوف بالمخاطر', emoji: '🌾', isCorrect: true },
      { text: 'العيش في مكان مزدحم فقط', emoji: '🏙️', isCorrect: false },
      { text: 'تغيير البيت كل يوم', emoji: '🏡', isCorrect: false },
    ],
    explanation: 'راحة البال والرضا بما نملك هما سر السعادة الحقيقية!',
  },
];

export const StoryQuizGame: React.FC<StoryQuizGameProps> = ({ soundEnabled, onPlaySound }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const q = QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    if (soundEnabled && onPlaySound) onPlaySound();

    setSelectedOption(idx);
    setIsAnswered(true);

    if (q.options[idx].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsFinished(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-3 sm:p-5 bg-gradient-to-br from-amber-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl sm:rounded-3xl border border-amber-200/80 dark:border-indigo-900/60 shadow-lg text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
            👑
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-200">
              تحدي أبطال الحكايات
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              أسئلة ممتعة عن أروع القيم والدروس المستفادة من قصصنا!
            </p>
          </div>
        </div>

        {/* Progress & Reset */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            السؤال {currentIdx + 1} من {QUESTIONS.length}
          </span>
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
            title="إعادة التحدي"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="w-full flex flex-col gap-3 my-2">
          {/* Story Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-200/60 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-black w-fit">
            <span>{q.storyEmoji}</span>
            <span>حكاية: {q.storyTitle}</span>
          </div>

          {/* Question Text */}
          <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-relaxed p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {q.question}
          </h4>

          {/* Options */}
          <div className="flex flex-col gap-2 w-full mt-1">
            {q.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400';

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnClass = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                } else if (isSelected && !opt.isCorrect) {
                  btnClass = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-100';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`flex items-center justify-between p-3 rounded-2xl border-2 text-right transition cursor-pointer min-h-[50px] shadow-xs active:scale-[0.99] ${btnClass}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{opt.emoji}</span>
                    <span className="text-xs sm:text-sm font-bold leading-normal">
                      {opt.text}
                    </span>
                  </div>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Button */}
          {isAnswered && (
            <div className="mt-2 p-3 rounded-2xl bg-amber-100/80 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 animate-twinkle flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                ✨ {q.explanation}
              </p>
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md active:scale-95 transition cursor-pointer shrink-0"
              >
                {currentIdx + 1 < QUESTIONS.length ? 'السؤال التالي ➔' : 'عرض النتيجة 🏆'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Final Victory Badge & Certificate */
        <div className="w-full flex flex-col items-center text-center p-5 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 text-white shadow-xl animate-bounce-slow gap-3">
          <Trophy className="w-14 h-14 fill-yellow-200 animate-spin-slow" />
          <h4 className="text-xl font-black">مبارك! أنت بطل الحكايات الذكي! 👑🌟</h4>
          <p className="text-sm font-bold">
            حصلت على {score} من {QUESTIONS.length} إجابات صحيحة!
          </p>
          <div className="flex items-center justify-center gap-1 my-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round((score / QUESTIONS.length) * 5)
                    ? 'fill-yellow-200 text-yellow-200'
                    : 'text-white/40'
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="mt-2 px-6 py-2.5 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-amber-100 transition shadow-md active:scale-95 cursor-pointer"
          >
            إعادة التحدي ↺
          </button>
        </div>
      )}
    </div>
  );
};
