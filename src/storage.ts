import type { Level } from './game/types';

const COMPLETED_KEY = 'flow2flow:completed';
const EFFECTS_KEY = 'flow2flow:effects';
const THEME_KEY = 'flow2flow:theme';
const TUTORIAL_KEY = 'flow2flow:tutorialSeen';
const GENERATED_KEY = 'flow2flow:generated';
const BEST_PREFIX = 'flow2flow:best:';

export type Theme = 'light' | 'dark';

export const getCompleted = (): Set<string> => {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
};

export const markCompleted = (levelId: string): void => {
  const s = getCompleted();
  s.add(levelId);
  try { localStorage.setItem(COMPLETED_KEY, JSON.stringify([...s])); } catch { /* */ }
};

export const getEffectsEnabled = (): boolean => {
  try {
    const v = localStorage.getItem(EFFECTS_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
};

export const setEffectsEnabled = (on: boolean): void => {
  try { localStorage.setItem(EFFECTS_KEY, on ? 'true' : 'false'); } catch { /* */ }
};

export const getTheme = (): Theme => {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export const setTheme = (t: Theme): void => {
  try { localStorage.setItem(THEME_KEY, t); } catch { /* */ }
};

export const getTutorialSeen = (): boolean => {
  try { return localStorage.getItem(TUTORIAL_KEY) === 'true'; } catch { return false; }
};

export const markTutorialSeen = (): void => {
  try { localStorage.setItem(TUTORIAL_KEY, 'true'); } catch { /* */ }
};

export const getBestMoves = (levelId: string): number | null => {
  try {
    const v = localStorage.getItem(BEST_PREFIX + levelId);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
};

export const recordSolve = (levelId: string, moves: number): { isNewBest: boolean; prevBest: number | null } => {
  const prev = getBestMoves(levelId);
  if (prev === null || moves < prev) {
    try { localStorage.setItem(BEST_PREFIX + levelId, String(moves)); } catch { /* */ }
    return { isNewBest: true, prevBest: prev };
  }
  return { isNewBest: false, prevBest: prev };
};

export const getAllBests = (): Map<string, number> => {
  const out = new Map<string, number>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(BEST_PREFIX)) continue;
      const id = key.slice(BEST_PREFIX.length);
      const v = Number(localStorage.getItem(key));
      if (Number.isFinite(v)) out.set(id, v);
    }
  } catch { /* */ }
  return out;
};

export const computeStars = (moves: number, pairCount: number): 0 | 1 | 2 | 3 => {
  if (moves <= pairCount) return 3;
  if (moves <= pairCount + 2) return 2;
  return 1;
};

export const getGeneratedLevels = (): Level[] => {
  try {
    const raw = localStorage.getItem(GENERATED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as Level[];
  } catch {
    return [];
  }
};

export const saveGeneratedLevel = (lvl: Level): void => {
  const existing = getGeneratedLevels();
  const updated = [...existing, lvl];
  try { localStorage.setItem(GENERATED_KEY, JSON.stringify(updated)); } catch { /* */ }
};

export const clearGeneratedLevels = (): void => {
  try { localStorage.removeItem(GENERATED_KEY); } catch { /* */ }
};
