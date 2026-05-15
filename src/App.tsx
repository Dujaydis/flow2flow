import { useEffect, useReducer, useRef, useState } from 'react';
import { reducer, initialState } from './game/reducer';
import { isSolved, pathProgress } from './game/rules';
import { LEVELS, findNextInPack } from './game/levels';
import { Board } from './ui/Board';
import { LevelSelect } from './ui/LevelSelect';
import { Particles } from './ui/Particles';
import { GeneratorPanel } from './ui/GeneratorPanel';
import { HUD } from './ui/HUD';
import {
  getEffectsEnabled, setEffectsEnabled,
  getTheme, setTheme,
  getTutorialSeen, markTutorialSeen,
  getCompleted, markCompleted,
  getAllBests, recordSolve, computeStars,
  getGeneratedLevels, saveGeneratedLevel, clearGeneratedLevels,
} from './storage';
import type { Theme } from './storage';
import { playSolveSound, playConnectSound, playUndoSound } from './sound';
import { connectHaptic, solveHaptic } from './haptics';
import type { Level } from './game/types';

type View = 'menu' | 'game';

const getFirstLevel = (): Level => {
  const l = LEVELS[0];
  if (!l) throw new Error('No levels defined');
  return l;
};

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [state, dispatch] = useReducer(reducer, getFirstLevel(), initialState);
  const [effects, setEffectsState] = useState<boolean>(() => getEffectsEnabled());
  const [theme, setThemeState] = useState<Theme>(() => getTheme());
  const [generated, setGenerated] = useState<Level[]>(() => getGeneratedLevels());
  const [completed, setCompleted] = useState<Set<string>>(() => getCompleted());
  const [bests, setBests] = useState<Map<string, number>>(() => getAllBests());
  const [showTutorial, setShowTutorial] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [solveDetail, setSolveDetail] = useState<{ moves: number; stars: number; isNewBest: boolean } | null>(null);
  const justConnectedSize = state.justConnected.size;
  const lastConnectedKey = useRef<string>('');

  const solved = isSolved(state);
  const progress = pathProgress(state);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (justConnectedSize === 0) return;
    const key = [...state.justConnected].sort().join(',');
    if (key === lastConnectedKey.current) return;
    lastConnectedKey.current = key;
    if (effects) {
      playConnectSound();
      connectHaptic();
    }
    const t = setTimeout(() => {
      dispatch({ type: 'CLEAR_CONNECTED_FLASH' });
      lastConnectedKey.current = '';
    }, 520);
    return () => clearTimeout(t);
  }, [justConnectedSize, state.justConnected, effects]);

  useEffect(() => {
    if (!solved) return;
    const id = state.level.id;
    const moves = state.moves;
    const result = recordSolve(id, moves);
    setBests(prev => {
      const next = new Map(prev);
      const newBest = result.isNewBest ? moves : Math.min(prev.get(id) ?? Infinity, moves);
      next.set(id, newBest);
      return next;
    });
    if (!completed.has(id)) {
      markCompleted(id);
      setCompleted(prev => new Set(prev).add(id));
    }
    const stars = computeStars(moves, state.level.pairs.length);
    setSolveDetail({ moves, stars, isNewBest: result.isNewBest });
    setCelebrating(true);
    if (effects) {
      playSolveSound();
      solveHaptic();
    }
    const t = setTimeout(() => setCelebrating(false), 1600);
    return () => clearTimeout(t);
  }, [solved, state.level.id, state.moves, state.level.pairs.length, effects, completed]);

  const startLevel = (lvl: Level) => {
    dispatch({ type: 'LOAD_LEVEL', level: lvl });
    setCelebrating(false);
    setSolveDetail(null);
    setView('game');
    if (!getTutorialSeen()) {
      setShowTutorial(true);
    }
  };

  const dismissTutorial = () => {
    setShowTutorial(false);
    markTutorialSeen();
  };

  const handleGenerated = (lvl: Level) => {
    saveGeneratedLevel(lvl);
    setGenerated(getGeneratedLevels());
  };

  const handleNextLevel = () => {
    const next = findNextInPack(state.level);
    if (next) {
      startLevel(next);
    } else {
      setView('menu');
    }
  };

  const handleReplay = () => {
    dispatch({ type: 'RESET_LEVEL' });
    setSolveDetail(null);
    setCelebrating(false);
  };

  const handleUndo = () => {
    if (state.history.length === 0) return;
    dispatch({ type: 'UNDO' });
    if (effects) playUndoSound();
  };

  if (view === 'menu') {
    return (
      <div className="app menu">
        <header className="menu-header">
          <h1>Flow2Flow</h1>
          <div className="menu-settings">
            <label className="toggle">
              <input
                type="checkbox"
                checked={effects}
                onChange={(e) => {
                  setEffectsState(e.target.checked);
                  setEffectsEnabled(e.target.checked);
                }}
              />
              Effects
            </label>
            <button
              className="theme-button"
              onClick={() => {
                const next: Theme = theme === 'light' ? 'dark' : 'light';
                setThemeState(next);
                setTheme(next);
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '☾' : '☀'}
            </button>
          </div>
        </header>
        <LevelSelect
          onSelect={startLevel}
          generatedLevels={generated}
          onClearGenerated={() => { clearGeneratedLevels(); setGenerated([]); }}
          completed={completed}
          bests={bests}
        />
        <GeneratorPanel onGenerated={handleGenerated} onPlay={startLevel} />
      </div>
    );
  }

  const bestForLevel = bests.get(state.level.id) ?? null;
  const canUndo = state.history.length > 0;
  const nextLevel = findNextInPack(state.level);

  return (
    <div className={`app game${celebrating ? ' shake' : ''}`}>
      <header className="game-header">
        <button className="ghost" onClick={() => setView('menu')} aria-label="back to levels">‹ Levels</button>
        <span className="level-title">{state.level.displayName}</span>
        <span className="header-spacer" aria-hidden />
      </header>
      <HUD
        connected={progress.connected}
        totalPairs={progress.total}
        coverage={progress.coverage}
        totalCells={progress.totalCells}
        moves={state.moves}
        bestMoves={bestForLevel}
      />
      <div className="board-wrap">
        <Board state={state} dispatch={dispatch} />
        {solveDetail && !celebrating && (
          <div className="solve-overlay">
            <div className="solve-card">
              <div className="solve-stars">
                {[0, 1, 2].map(i => (
                  <span key={i} className={i < solveDetail.stars ? 'star big filled' : 'star big'}>★</span>
                ))}
              </div>
              <div className="solve-title">Solved!</div>
              <div className="solve-meta">
                Moves: <b>{solveDetail.moves}</b>
                {solveDetail.isNewBest && <span className="badge">NEW BEST</span>}
              </div>
              <div className="solve-actions">
                <button onClick={handleReplay}>Replay</button>
                {nextLevel ? (
                  <button className="primary" onClick={handleNextLevel}>Next →</button>
                ) : (
                  <button className="primary" onClick={() => setView('menu')}>Back to Packs</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="game-actions">
        <button onClick={handleUndo} disabled={!canUndo} aria-label="Undo last drag">↶ Undo</button>
        <button onClick={() => { dispatch({ type: 'RESET_LEVEL' }); setSolveDetail(null); }} aria-label="Reset level">Reset</button>
      </div>
      {celebrating && <Particles />}
      {showTutorial && (
        <div className="tutorial-overlay" onClick={dismissTutorial}>
          <div className="tutorial-card" onClick={(e) => e.stopPropagation()}>
            <h2>How to play</h2>
            <p>Drag from a colored dot to its matching dot of the same color.</p>
            <p>Paths cannot cross. <b>Fill every square</b> to solve the level.</p>
            <button className="primary" onClick={dismissTutorial}>Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}
