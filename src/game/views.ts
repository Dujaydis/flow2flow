import type { Coord, GameState } from './types';
import { cellKey } from './rules';

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
}

const fresh = (): CellView => ({
  endpointColor: null,
  pathColor: null,
  prevDir: null,
  nextDir: null,
  isTail: false,
  isActive: false,
});

export const computeCellViews = (state: GameState): Map<string, CellView> => {
  const views = new Map<string, CellView>();
  const get = (key: string): CellView => {
    let v = views.get(key);
    if (!v) { v = fresh(); views.set(key, v); }
    return v;
  };
  for (const pair of state.level.pairs) {
    get(cellKey(pair.a)).endpointColor = pair.color;
    get(cellKey(pair.b)).endpointColor = pair.color;
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
