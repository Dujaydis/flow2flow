import type { Level } from './game/types';

const COMPLETED_KEY = 'flow2flow:completed';
const MUTED_KEY = 'flow2flow:muted';
const GENERATED_KEY = 'flow2flow:generated';

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

export const getMuted = (): boolean => {
  try { return localStorage.getItem(MUTED_KEY) === 'true'; } catch { return false; }
};

export const setMuted = (m: boolean): void => {
  try { localStorage.setItem(MUTED_KEY, m ? 'true' : 'false'); } catch { /* */ }
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
