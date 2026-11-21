import { lazy, Suspense } from 'react';

export type ActiveGameId = 'memory' | 'puzzle' | 'spot' | 'coloring' | 'quiz' | 'runner' | 'count' | 'pattern';

const games = {
  memory: lazy(() => import('./MemoryGame').then(({ MemoryGame }) => ({ default: MemoryGame }))),
  puzzle: lazy(() => import('./PuzzleGame').then(({ PuzzleGame }) => ({ default: PuzzleGame }))),
  spot: lazy(() => import('./SpotDifferenceGame').then(({ SpotDifferenceGame }) => ({ default: SpotDifferenceGame }))),
  coloring: lazy(() => import('./ColoringGame').then(({ ColoringGame }) => ({ default: ColoringGame }))),
  quiz: lazy(() => import('./StoryQuizGame').then(({ StoryQuizGame }) => ({ default: StoryQuizGame }))),
  runner: lazy(() => import('./MagicForestRunner').then(({ MagicForestRunner }) => ({ default: MagicForestRunner }))),
};
const QuickGame = lazy(() => import('./QuickGame').then(({ QuickGame }) => ({ default: QuickGame })));

export function GameSurface({ id, soundEnabled, onPlaySound }: {
  id: ActiveGameId;
  soundEnabled: boolean;
  onPlaySound?: () => void;
}) {
  const props = { soundEnabled, onPlaySound };
  let content;
  if (id === 'count' || id === 'pattern') {
    content = <QuickGame key={id} mode={id} {...props} />;
  } else {
    const Game = games[id];
    content = <Game {...props} />;
  }

  return <Suspense fallback={<p role="status" className="p-3 text-center">جاري فتح اللعبة…</p>}>{content}</Suspense>;
}
