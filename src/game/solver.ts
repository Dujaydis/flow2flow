import type { Coord, Level } from './types';
import { cellKey, coordsEqual, levelInBounds, levelNeighbors, levelTotalCells } from './rules';

export type Solution = ReadonlyMap<string, ReadonlyArray<Coord>>;

interface SolveOpts {
  maxSolutions?: number;
  timeoutMs?: number;
}

export const solve = (level: Level, opts: SolveOpts = {}): Solution[] => {
  const maxSolutions = opts.maxSolutions ?? 2;
  const timeoutMs = opts.timeoutMs ?? 5000;
  const deadline = Date.now() + timeoutMs;
  const solutions: Solution[] = [];

  const colors = level.pairs.map(p => p.color);
  const startCoords = new Map<string, Coord>();
  const endCoords = new Map<string, Coord>();
  for (const pair of level.pairs) {
    startCoords.set(pair.color, pair.a);
    endCoords.set(pair.color, pair.b);
  }

  const paths = new Map<string, Coord[]>();
  const occupied = new Map<string, string>();
  for (const pair of level.pairs) {
    paths.set(pair.color, [pair.a]);
    occupied.set(cellKey(pair.a), pair.color);
    occupied.set(cellKey(pair.b), pair.color);
  }

  const totalCells = levelTotalCells(level);

  const isFinished = (color: string): boolean => {
    const path = paths.get(color);
    if (!path || path.length === 0) return false;
    const last = path[path.length - 1];
    const end = endCoords.get(color);
    return !!(last && end && coordsEqual(last, end));
  };

  const allFinished = (): boolean => {
    for (const c of colors) if (!isFinished(c)) return false;
    return true;
  };

  const totalCovered = (): number => {
    let n = 0;
    for (const p of paths.values()) n += p.length;
    return n;
  };

  const legalMoves = (color: string): Coord[] => {
    const path = paths.get(color);
    if (!path) return [];
    const tail = path[path.length - 1];
    if (!tail) return [];
    const end = endCoords.get(color);
    const moves: Coord[] = [];
    for (const next of levelNeighbors(level, tail)) {
      const occ = occupied.get(cellKey(next));
      if (occ === undefined) {
        moves.push(next);
      } else if (occ === color && end && coordsEqual(next, end)) {
        moves.push(next);
      }
    }
    return moves;
  };

  const isReachable = (): boolean => {
    const reachableEmpty = new Set<string>();
    for (const color of colors) {
      if (isFinished(color)) continue;
      const path = paths.get(color);
      if (!path) continue;
      const tail = path[path.length - 1];
      if (!tail) continue;
      const end = endCoords.get(color);
      if (!end) continue;
      const endKey = cellKey(end);
      const visited = new Set<string>();
      visited.add(cellKey(tail));
      const queue: Coord[] = [tail];
      let foundEnd = false;
      while (queue.length > 0) {
        const cur = queue.shift();
        if (!cur) break;
        const curKey = cellKey(cur);
        if (curKey === endKey) foundEnd = true;
        for (const nb of levelNeighbors(level, cur)) {
          const nKey = cellKey(nb);
          if (visited.has(nKey)) continue;
          const occ = occupied.get(nKey);
          if (occ === undefined) {
            visited.add(nKey);
            reachableEmpty.add(nKey);
            queue.push(nb);
          } else if (occ === color && nKey === endKey) {
            visited.add(nKey);
            queue.push(nb);
          }
        }
      }
      if (!foundEnd) return false;
    }
    for (let r = 0; r < level.height; r++) {
      for (let c = 0; c < level.width; c++) {
        const cell: Coord = [r, c];
        if (!levelInBounds(level, cell)) continue;
        const key = cellKey(cell);
        if (occupied.has(key)) continue;
        if (!reachableEmpty.has(key)) return false;
      }
    }
    return true;
  };

  const recurse = (): void => {
    if (solutions.length >= maxSolutions) return;
    if (Date.now() > deadline) return;

    if (allFinished()) {
      if (totalCovered() === totalCells) {
        const snapshot = new Map<string, ReadonlyArray<Coord>>();
        for (const [c, p] of paths) snapshot.set(c, p.slice());
        solutions.push(snapshot);
      }
      return;
    }

    if (!isReachable()) return;

    let bestColor: string | null = null;
    let bestMoves: Coord[] = [];
    let bestCount = Infinity;
    for (const color of colors) {
      if (isFinished(color)) continue;
      const moves = legalMoves(color);
      if (moves.length === 0) return;
      if (moves.length < bestCount) {
        bestCount = moves.length;
        bestColor = color;
        bestMoves = moves;
        if (bestCount === 1) break;
      }
    }

    if (!bestColor) return;
    const colorPath = paths.get(bestColor);
    if (!colorPath) return;
    const endpoint = endCoords.get(bestColor);

    for (const move of bestMoves) {
      if (solutions.length >= maxSolutions) return;
      colorPath.push(move);
      const isOwnEnd = !!(endpoint && coordsEqual(move, endpoint));
      const occKey = cellKey(move);
      if (!isOwnEnd) occupied.set(occKey, bestColor);
      recurse();
      colorPath.pop();
      if (!isOwnEnd) occupied.delete(occKey);
    }
  };

  recurse();
  return solutions;
};

export const isSolvable = (level: Level, timeoutMs = 3000): boolean =>
  solve(level, { maxSolutions: 1, timeoutMs }).length > 0;

export const hasUniqueSolution = (level: Level, timeoutMs = 3000): boolean => {
  const sols = solve(level, { maxSolutions: 2, timeoutMs });
  return sols.length === 1;
};
