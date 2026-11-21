import { useId, useState } from 'react';

const shapes = [
  { symbol: '⭐', name: 'نجمة' },
  { symbol: '🌙', name: 'هلال' },
  { symbol: '☁️', name: 'سحابة' },
  { symbol: '🍎', name: 'تفاحة' },
  { symbol: '🦋', name: 'فراشة' },
];

const totalRounds = 5;

type Mode = 'count' | 'pattern';

function shuffle<T>(items: T[]) {
  const deck = [...items];
  for (let index = deck.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return deck;
}

function makeRound(mode: Mode, round: number) {
  const symbols = shuffle(shapes).slice(0, 3);
  if (mode === 'count') {
    const count = 2 + Math.floor(Math.random() * (round + 3));
    return {
      sequence: Array.from({ length: count }, () => symbols[0]),
      choices: shuffle([count - 1, count, count + 1]).map((number) => String(number)),
      answer: String(count),
    };
  }

  const motif = round < 2 ? symbols.slice(0, 2) : symbols;
  const next = round % motif.length;
  const answer = motif[next].name;
  const sequence = [...motif, ...motif, ...motif.slice(0, next)];
  const wrong = shuffle(shapes.filter((shape) => shape.name !== answer)).slice(0, 2);
  const choices = shuffle([answer, ...wrong.map((shape) => shape.name)]);
  return { sequence, choices, answer };
}

export function QuickGame({ mode, soundEnabled, onPlaySound }: {
  mode: Mode;
  soundEnabled: boolean;
  onPlaySound?: () => void;
}) {
  const questionId = useId();
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState(() => makeRound(mode, 0));
  const [wrong, setWrong] = useState<string[]>([]);
  const [correct, setCorrect] = useState(false);
  const [finished, setFinished] = useState(false);

  function choose(value: string) {
    if (correct || wrong.includes(value)) return;
    if (soundEnabled) onPlaySound?.();
    if (value === question.answer) setCorrect(true);
    else setWrong((previous) => [...previous, value]);
  }

  function startRound(next: number) {
    setRound(next);
    setQuestion(makeRound(mode, next));
    setCorrect(false);
    setWrong([]);
    setFinished(false);
  }

  const title = mode === 'count' ? 'عُدّ الأشكال' : 'كمّل النمط';

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-200 bg-white p-4 text-center dark:border-indigo-900 dark:bg-slate-900 sm:p-6">
      <h3 className="text-xl font-black">{title}</h3>
      {finished ? (
        <div className="mt-3 space-y-3">
          <p role="status" className="font-bold">برافو! خلّصت الخمس جولات 🎉</p>
          <button type="button" className="quick-game-action" onClick={() => startRound(0)}>العب من جديد</button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">الجولة {round + 1} من {totalRounds}</p>
          <p className="my-3 font-bold" id={questionId}>
            {mode === 'count' ? 'كام شكل شايف قدامك؟' : 'اختار الشكل اللي ييجي بعد آخر شكل.'}
          </p>
          <div role="img" aria-label={question.sequence.map(shape => shape.name).join('، ')} dir="ltr"
            className="mb-4 flex flex-wrap justify-center gap-2 rounded-xl bg-indigo-50 p-3 text-3xl dark:bg-slate-800">
            {question.sequence.map((shape, index) => <span key={index} aria-hidden="true">{shape.symbol}</span>)}
            {mode === 'pattern' && <span aria-hidden="true">❔</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-labelledby={questionId}>
            {question.choices.map((choice) => (
              <button type="button" key={choice} onClick={() => choose(choice)} disabled={correct || wrong.includes(choice)}
                className="min-h-12 min-w-14 rounded-xl border-2 border-indigo-200 px-3 text-base font-bold hover:border-indigo-500 disabled:opacity-50 dark:border-indigo-800">
                {mode === 'pattern' ? (
                  <><span aria-hidden="true">{shapes.find(shape => shape.name === choice)?.symbol}</span><span className="sr-only">{choice}</span></>
                ) : choice}
              </button>
            ))}
          </div>
          <p role="status" className="mt-3 min-h-6 font-bold">
            {correct ? 'إجابة صح!' : wrong.length ? 'جرّب مرة تانية.' : ''}
          </p>
          {correct && <button type="button" className="quick-game-action mt-2" onClick={() => {
            if (round + 1 === totalRounds) setFinished(true);
            else startRound(round + 1);
          }}>{round + 1 === totalRounds ? 'شوف النتيجة' : 'الجولة اللي بعدها'}</button>}
        </>
      )}
    </div>
  );
}
