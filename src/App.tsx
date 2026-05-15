import { useEffect, useReducer, useState } from 'react';
import { reducer, initialState } from './game/reducer';
import { isSolved, pathProgress } from './game/rules';
import { LEVELS } from './game/levels';
import { Board } from './ui/Board';
import { LevelSelect } from './ui/LevelSelect';
import { Particles } from './ui/Particles';
import { GeneratorPanel } from './ui/GeneratorPanel';
import {
  getMuted, setMuted as persistMuted,
  markCompleted, getCompleted,
  getGeneratedLevels, saveGeneratedLevel, clearGeneratedLevels,
} from './storage';
import { playSolveSound, playConnectSound } from './sound';
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
  const [muted, setMutedState] = useState<boolean>(() => getMuted());
  const [generated, setGenerated] = useState<Level[]>(() => getGeneratedLevels());
  const [completed, setCompleted] = useState<Set<string>>(() => getCompleted());
  const [celebrating, setCelebrating] = useState(false);
  const [lastConnectedCount, setLastConnectedCount] = useState(0);

  const solved = isSolved(state);
  const progress = pathProgress(state);

  useEffect(() => {
    if (progress.connected > lastConnectedCount && !muted) {
      playConnectSound();
    }
    setLastConnectedCount(progress.connected);
  }, [progress.connected, lastConnectedCount, muted]);

  useEffect(() => {
    if (!solved) return;
    if (!completed.has(state.level.id)) {
      markCompleted(state.level.id);
      setCompleted(prev => new Set(prev).add(state.level.id));
    }
    setCelebrating(true);
    if (!muted) playSolveSound();
    const t = setTimeout(() => setCelebrating(false), 1400);
    return () => clearTimeout(t);
  }, [solved, state.level.id, muted, completed]);

  const startLevel = (lvl: Level) => {
    dispatch({ type: 'LOAD_LEVEL', level: lvl });
    setLastConnectedCount(0);
    setCelebrating(false);
    setView('game');
  };

  const handleGenerated = (lvl: Level) => {
    saveGeneratedLevel(lvl);
    setGenerated(getGeneratedLevels());
  };

  if (view === 'menu') {
    return (
      <div className="app menu">
        <header className="menu-header">
          <h1>Flow2Flow</h1>
          <label className="mute-toggle">
            <input
              type="checkbox"
              checked={muted}
              onChange={(e) => {
                setMutedState(e.target.checked);
                persistMuted(e.target.checked);
              }}
            />
            Mute
          </label>
        </header>
        <LevelSelect
          onSelect={startLevel}
          generatedLevels={generated}
          onClearGenerated={() => { clearGeneratedLevels(); setGenerated([]); }}
          completed={completed}
        />
        <GeneratorPanel onGenerated={handleGenerated} onPlay={startLevel} />
      </div>
    );
  }

  return (
    <div className={`app game${celebrating ? ' shake' : ''}`}>
      <header className="game-header">
        <button onClick={() => setView('menu')}>← Levels</button>
        <span className="level-title">{state.level.id}</span>
        <button onClick={() => { dispatch({ type: 'RESET_LEVEL' }); setLastConnectedCount(0); }}>
          Reset
        </button>
      </header>
      <Board state={state} dispatch={dispatch} />
      <div className="status">
        {solved
          ? '✓ Solved'
          : `${progress.connected}/${progress.total} pairs · ${progress.coverage}/${progress.totalCells} cells`}
      </div>
      {celebrating && <Particles />}
    </div>
  );
}
