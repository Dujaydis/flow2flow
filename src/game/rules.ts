import type { Coord, GameState, Level, LevelTopology, Pair } from './types';

export const cellKey = (c: Coord): string => `${c[0]},${c[1]}`;

export const coordsEqual = (a: Coord, b: Coord): boolean =>
  a[0] === b[0] && a[1] === b[1];

const topologyOf = (level: Pick<Level, 'topology'>): LevelTopology =>
  level.topology ?? { kind: 'flat' };

export const isAdjacent = (a: Coord, b: Coord): boolean => {
  const dr = Math.abs(a[0] - b[0]);
  const dc = Math.abs(a[1] - b[1]);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
};

export const inBounds = (cell: Coord, width: number, height: number): boolean =>
  cell[0] >= 0 && cell[0] < height && cell[1] >= 0 && cell[1] < width;

export const levelInBounds = (level: Level, cell: Coord): boolean => {
  if (!inBounds(cell, level.width, level.height)) return false;
  const t = topologyOf(level);
  if (t.kind === 'cube') {
    if (cell[0] < t.faceSize && cell[1] >= t.faceSize) return false;
  }
  return true;
};

export const levelTotalCells = (level: Level): number => {
  const t = topologyOf(level);
  if (t.kind === 'cube') return 3 * t.faceSize * t.faceSize;
  return level.width * level.height;
};

export const cubeSeamPartner = (faceSize: number, cell: Coord): Coord | null => {
  const N = faceSize;
  if (cell[0] >= 0 && cell[0] < N && cell[1] === N - 1) {
    return [N, 2 * N - 1 - cell[0]];
  }
  if (cell[0] === N && cell[1] >= N && cell[1] <= 2 * N - 1) {
    return [2 * N - 1 - cell[1], N - 1];
  }
  return null;
};

export const levelNeighbors = (level: Level, cell: Coord): Coord[] => {
  const result: Coord[] = [];
  const dirs: ReadonlyArray<Coord> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of dirs) {
    const next: Coord = [cell[0] + dr, cell[1] + dc];
    if (levelInBounds(level, next)) result.push(next);
  }
  const t = topologyOf(level);
  if (t.kind === 'cube') {
    const partner = cubeSeamPartner(t.faceSize, cell);
    if (partner) result.push(partner);
  }
  return result;
};

export const levelAreAdjacent = (level: Level, a: Coord, b: Coord): boolean => {
  if (isAdjacent(a, b)) return true;
  const t = topologyOf(level);
  if (t.kind === 'cube') {
    const partner = cubeSeamPartner(t.faceSize, a);
    if (partner && coordsEqual(partner, b)) return true;
  }
  return false;
};

export const levelAllCells = (level: Level): Coord[] => {
  const out: Coord[] = [];
  for (let r = 0; r < level.height; r++) {
    for (let c = 0; c < level.width; c++) {
      const cell: Coord = [r, c];
      if (levelInBounds(level, cell)) out.push(cell);
    }
  }
  return out;
};

export interface OccupantInfo {
  readonly color: string;
  readonly isEndpoint: boolean;
  readonly pathIndex: number;
  readonly pathLength: number;
}

export const occupant = (state: GameState): Map<string, OccupantInfo> => {
  const map = new Map<string, OccupantInfo>();
  const setCells = (color: string, path: ReadonlyArray<Coord>): void => {
    path.forEach((cell, idx) => {
      map.set(cellKey(cell), {
        color,
        isEndpoint: idx === 0 || idx === path.length - 1,
        pathIndex: idx,
        pathLength: path.length,
      });
    });
  };
  for (const [color, path] of state.paths) setCells(color, path);
  if (state.active) setCells(state.active.color, state.active.path);
  return map;
};

export const endpointColorAt = (level: Level, cell: Coord): string | null => {
  for (const pair of level.pairs) {
    if (coordsEqual(pair.a, cell) || coordsEqual(pair.b, cell)) return pair.color;
  }
  return null;
};

export const pairFor = (level: Level, color: string): Pair | null => {
  for (const pair of level.pairs) if (pair.color === color) return pair;
  return null;
};

export const otherEndpoint = (level: Level, color: string, cell: Coord): Coord | null => {
  const pair = pairFor(level, color);
  if (!pair) return null;
  if (coordsEqual(pair.a, cell)) return pair.b;
  if (coordsEqual(pair.b, cell)) return pair.a;
  return null;
};

export const findInPaths = (
  paths: ReadonlyMap<string, ReadonlyArray<Coord>>,
  cell: Coord,
): { color: string; index: number } | null => {
  for (const [color, path] of paths) {
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      if (p && coordsEqual(p, cell)) return { color, index: i };
    }
  }
  return null;
};

export const isSolved = (state: GameState): boolean => {
  const { level, paths } = state;
  if (state.active) return false;
  for (const pair of level.pairs) {
    const path = paths.get(pair.color);
    if (!path || path.length < 2) return false;
    const first = path[0];
    const last = path[path.length - 1];
    if (!first || !last) return false;
    const connects =
      (coordsEqual(first, pair.a) && coordsEqual(last, pair.b)) ||
      (coordsEqual(first, pair.b) && coordsEqual(last, pair.a));
    if (!connects) return false;
    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];
      const cur = path[i];
      if (!prev || !cur || !levelAreAdjacent(level, prev, cur)) return false;
    }
  }
  const covered = new Set<string>();
  for (const path of paths.values()) for (const c of path) covered.add(cellKey(c));
  return covered.size === levelTotalCells(level);
};

export const pathProgress = (state: GameState): { connected: number; total: number; coverage: number; totalCells: number } => {
  let connected = 0;
  const total = state.level.pairs.length;
  for (const pair of state.level.pairs) {
    const path = state.paths.get(pair.color);
    if (!path || path.length < 2) continue;
    const first = path[0];
    const last = path[path.length - 1];
    if (!first || !last) continue;
    const connects =
      (coordsEqual(first, pair.a) && coordsEqual(last, pair.b)) ||
      (coordsEqual(first, pair.b) && coordsEqual(last, pair.a));
    if (connects) connected++;
  }
  const covered = new Set<string>();
  for (const path of state.paths.values()) for (const c of path) covered.add(cellKey(c));
  return {
    connected,
    total,
    coverage: covered.size,
    totalCells: levelTotalCells(state.level),
  };
};
