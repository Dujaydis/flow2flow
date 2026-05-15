import type { Coord, GameState, PathsMap, Level } from './types';
import { cellKey, coordsEqual, pairFor } from './rules';

export type Direction = 'up' | 'down' | 'left' | 'right';

export const dirBetween = (from: Coord, to: Coord): Direction | null => {
  if (to[0] === from[0] && to[1] === from[1] + 1) return 'right';
  if (to[0] === from[0] && to[1] === from[1] - 1) return 'left';
  if (to[1] === from[1] && to[0] === from[0] + 1) return 'down';
  if (to[1] === from[1] && to[0] === from[0] - 1) return 'up';
  return null;
};

export interface CellView {
  endpointColor: string | null;
  pathColor: string | null;
  prevDir: Direction | null;
  nextDir: Direction | null;
  isTail: boolean;
  isActive: boolean;
  endpointConnected: boolean;
  justConnected: boolean;
}

const fresh = (): CellView => ({
  endpointColor: null,
  pathColor: null,
  prevDir: null,
  nextDir: null,
  isTail: false,
  isActive: false,
  endpointConnected: false,
  justConnected: false,
});

const isPairConnected = (level: Level, color: string, paths: PathsMap): boolean => {
  const path = paths.get(color);
  if (!path || path.length < 2) return false;
  const first = path[0];
  const last = path[path.length - 1];
  if (!first || !last) return false;
  const pair = pairFor(level, color);
  if (!pair) return false;
  return (
    (coordsEqual(first, pair.a) && coordsEqual(last, pair.b)) ||
    (coordsEqual(first, pair.b) && coordsEqual(last, pair.a))
  );
};

export const computeCellViews = (state: GameState): Map<string, CellView> => {
  const views = new Map<string, CellView>();
  const get = (key: string): CellView => {
    let v = views.get(key);
    if (!v) { v = fresh(); views.set(key, v); }
    return v;
  };
  const connectedColors = new Set<string>();
  for (const pair of state.level.pairs) {
    if (isPairConnected(state.level, pair.color, state.paths)) {
      connectedColors.add(pair.color);
    }
  }
  for (const pair of state.level.pairs) {
    const connected = connectedColors.has(pair.color);
    const flash = state.justConnected.has(pair.color);
    const a = get(cellKey(pair.a));
    a.endpointColor = pair.color;
    a.endpointConnected = connected;
    a.justConnected = flash;
    const b = get(cellKey(pair.b));
    b.endpointColor = pair.color;
    b.endpointConnected = connected;
    b.justConnected = flash;
  }
  for (const [color, path] of state.paths) {
    path.forEach((cell, i) => {
      const v = get(cellKey(cell));
      v.pathColor = color;
      const prev = i > 0 ? path[i - 1] : null;
      const next = i < path.length - 1 ? path[i + 1] : null;
      v.prevDir = prev ? dirBetween(cell, prev) : null;
      v.nextDir = next ? dirBetween(cell, next) : null;
    });
  }
  if (state.active) {
    const { color, path } = state.active;
    path.forEach((cell, i) => {
      const v = get(cellKey(cell));
      v.pathColor = color;
      v.isActive = true;
      const prev = i > 0 ? path[i - 1] : null;
      const next = i < path.length - 1 ? path[i + 1] : null;
      v.prevDir = prev ? dirBetween(cell, prev) : null;
      v.nextDir = next ? dirBetween(cell, next) : null;
      v.isTail = i === path.length - 1;
    });
  }
  return views;
};
