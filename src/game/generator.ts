import type { Coord, Level, Pair } from './types';
import { cellKey, inBounds } from './rules';
import { solve } from './solver';
import { PALETTE_IDS } from './palette';

export interface GenerateOpts {
  width: number;
  height: number;
  pairCount: number;
  maxAttempts?: number;
  requireUnique?: boolean;
  idPrefix?: string;
  timeoutMs?: number;
}

const DIRECTIONS: ReadonlyArray<Coord> = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export const generate = (opts: GenerateOpts): Level | null => {
  const {
    width, height, pairCount,
    maxAttempts = 80,
    requireUnique = true,
    idPrefix = 'gen',
    timeoutMs = 6000,
  } = opts;

  if (pairCount < 1) return null;
  if (pairCount > PALETTE_IDS.length) return null;
  if (width * height < pairCount * 2) return null;

  const deadline = Date.now() + timeoutMs;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() > deadline) return null;
    const hamPath = findHamiltonianPath(width, height, 500);
    if (!hamPath) continue;

    const segments = cutPath(hamPath, pairCount);
    if (!segments) continue;

    const pairs: Pair[] = [];
    let valid = true;
    for (let i = 0; i < pairCount; i++) {
      const seg = segments[i];
      const color = PALETTE_IDS[i];
      if (!seg || seg.length < 2 || !color) { valid = false; break; }
      const a = seg[0];
      const b = seg[seg.length - 1];
      if (!a || !b) { valid = false; break; }
      pairs.push({ color, a, b });
    }
    if (!valid) continue;

    const stamp = Date.now().toString(36);
    const id = `${idPrefix}-${width}x${height}-${pairCount}p-${stamp}-${attempt}`;
    const level: Level = {
      id,
      pack: 'Generated',
      numberInPack: 0,
      displayName: `Generated ${width}×${height} · ${pairCount}p`,
      width, height, pairs,
    };

    if (requireUnique) {
      const sols = solve(level, { maxSolutions: 2, timeoutMs: 2500 });
      if (sols.length !== 1) continue;
    }
    return level;
  }
  return null;
};

const findHamiltonianPath = (width: number, height: number, timeoutMs = 500): Coord[] | null => {
  const total = width * height;
  const deadline = Date.now() + timeoutMs;
  const starts = shuffle(allCells(width, height));
  for (const start of starts) {
    if (Date.now() > deadline) return null;
    const path: Coord[] = [];
    const visited = new Set<string>();
    if (warnsdorff(start, path, visited, width, height, total, deadline)) {
      return path;
    }
  }
  return null;
};

const warnsdorff = (
  cell: Coord, path: Coord[], visited: Set<string>,
  w: number, h: number, total: number, deadline: number
): boolean => {
  if (Date.now() > deadline) return false;
  path.push(cell);
  visited.add(cellKey(cell));
  if (path.length === total) return true;
  const candidates: { cell: Coord; degree: number; rand: number }[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const nr = cell[0] + dr;
    const nc = cell[1] + dc;
    if (!inBounds([nr, nc], w, h)) continue;
    const nKey = `${nr},${nc}`;
    if (visited.has(nKey)) continue;
    let degree = 0;
    for (const [dr2, dc2] of DIRECTIONS) {
      const nnr = nr + dr2;
      const nnc = nc + dc2;
      if (!inBounds([nnr, nnc], w, h)) continue;
      if (!visited.has(`${nnr},${nnc}`)) degree++;
    }
    candidates.push({ cell: [nr, nc], degree, rand: Math.random() });
  }
  candidates.sort((a, b) => a.degree - b.degree || a.rand - b.rand);
  for (const { cell: next } of candidates) {
    if (warnsdorff(next, path, visited, w, h, total, deadline)) return true;
  }
  path.pop();
  visited.delete(cellKey(cell));
  return false;
};

const cutPath = (path: ReadonlyArray<Coord>, k: number): Coord[][] | null => {
  const total = path.length;
  if (total < k * 2) return null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const cuts: number[] = [0];
    let valid = true;
    for (let i = 0; i < k - 1; i++) {
      const lastCut = cuts[cuts.length - 1];
      if (lastCut === undefined) { valid = false; break; }
      const minNext = lastCut + 2;
      const maxNext = total - 2 * (k - 1 - i);
      if (minNext > maxNext) { valid = false; break; }
      const next = minNext + Math.floor(Math.random() * (maxNext - minNext + 1));
      cuts.push(next);
    }
    if (!valid) continue;
    cuts.push(total);
    const segments: Coord[][] = [];
    let ok = true;
    for (let i = 0; i < k; i++) {
      const a = cuts[i];
      const b = cuts[i + 1];
      if (a === undefined || b === undefined) { ok = false; break; }
      const seg = path.slice(a, b).map(c => [c[0], c[1]] as Coord);
      if (seg.length < 2) { ok = false; break; }
      segments.push(seg);
    }
    if (ok) return segments;
  }
  return null;
};

const allCells = (width: number, height: number): Coord[] => {
  const out: Coord[] = [];
  for (let r = 0; r < height; r++) for (let c = 0; c < width; c++) out.push([r, c]);
  return out;
};

const shuffle = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    const swap = arr[j];
    if (tmp !== undefined && swap !== undefined) {
      arr[i] = swap;
      arr[j] = tmp;
    }
  }
  return arr;
};
