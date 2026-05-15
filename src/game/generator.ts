import type { Coord, Level, LevelTopology, Pair } from './types';
import { cellKey, cubeSeamPartner } from './rules';
import { solve } from './solver';
import { PALETTE_IDS } from './palette';

export interface GenerateOpts {
  width?: number;
  height?: number;
  pairCount: number;
  topology?: LevelTopology;
  maxAttempts?: number;
  requireUnique?: boolean;
  idPrefix?: string;
  timeoutMs?: number;
}

const DIRECTIONS: ReadonlyArray<Coord> = [[-1, 0], [1, 0], [0, -1], [0, 1]];

const resolveTopology = (opts: GenerateOpts): { topology: LevelTopology; width: number; height: number } => {
  if (opts.topology?.kind === 'cube') {
    const N = opts.topology.faceSize;
    return { topology: opts.topology, width: 2 * N, height: 2 * N };
  }
  const width = opts.width ?? 6;
  const height = opts.height ?? width;
  return { topology: { kind: 'flat' }, width, height };
};

const cellInBounds = (topology: LevelTopology, width: number, height: number, cell: Coord): boolean => {
  if (cell[0] < 0 || cell[0] >= height || cell[1] < 0 || cell[1] >= width) return false;
  if (topology.kind === 'cube') {
    if (cell[0] < topology.faceSize && cell[1] >= topology.faceSize) return false;
  }
  return true;
};

const cellNeighbors = (topology: LevelTopology, width: number, height: number, cell: Coord): Coord[] => {
  const result: Coord[] = [];
  for (const [dr, dc] of DIRECTIONS) {
    const next: Coord = [cell[0] + dr, cell[1] + dc];
    if (cellInBounds(topology, width, height, next)) result.push(next);
  }
  if (topology.kind === 'cube') {
    const partner = cubeSeamPartner(topology.faceSize, cell);
    if (partner) result.push(partner);
  }
  return result;
};

const totalCellsOf = (topology: LevelTopology, width: number, height: number): number => {
  if (topology.kind === 'cube') return 3 * topology.faceSize * topology.faceSize;
  return width * height;
};

export const generate = (opts: GenerateOpts): Level | null => {
  const {
    pairCount,
    maxAttempts = 80,
    requireUnique = true,
    idPrefix = 'gen',
    timeoutMs = 6000,
  } = opts;

  const { topology, width, height } = resolveTopology(opts);
  const cells = totalCellsOf(topology, width, height);

  if (pairCount < 1) return null;
  if (pairCount > PALETTE_IDS.length) return null;
  if (cells < pairCount * 2) return null;

  const deadline = Date.now() + timeoutMs;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (Date.now() > deadline) return null;
    const hamPath = findHamiltonianPath(topology, width, height, 500);
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
    const id = `${idPrefix}-${topology.kind === 'cube' ? `c${topology.faceSize}` : `${width}x${height}`}-${pairCount}p-${stamp}-${attempt}`;
    const dim = topology.kind === 'cube' ? `Cube ${topology.faceSize}` : `${width}×${height}`;
    const level: Level = {
      id,
      pack: 'Generated',
      numberInPack: 0,
      displayName: `Generated ${dim} · ${pairCount}p`,
      width, height, pairs,
      topology,
    };

    const wantSolutions = requireUnique ? 2 : 1;
    const solutions = solve(level, { maxSolutions: wantSolutions, timeoutMs: 2500 });
    if (solutions.length === 0) continue;
    if (requireUnique && solutions.length > 1) continue;
    return level;
  }
  return null;
};

const findHamiltonianPath = (topology: LevelTopology, width: number, height: number, timeoutMs = 500): Coord[] | null => {
  const total = totalCellsOf(topology, width, height);
  const deadline = Date.now() + timeoutMs;
  const all: Coord[] = [];
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const cell: Coord = [r, c];
      if (cellInBounds(topology, width, height, cell)) all.push(cell);
    }
  }
  const starts = shuffle(all.slice());
  for (const start of starts) {
    if (Date.now() > deadline) return null;
    const path: Coord[] = [];
    const visited = new Set<string>();
    if (warnsdorff(topology, start, path, visited, width, height, total, deadline)) {
      return path;
    }
  }
  return null;
};

const warnsdorff = (
  topology: LevelTopology,
  cell: Coord, path: Coord[], visited: Set<string>,
  w: number, h: number, total: number, deadline: number
): boolean => {
  if (Date.now() > deadline) return false;
  path.push(cell);
  visited.add(cellKey(cell));
  if (path.length === total) return true;
  const candidates: { cell: Coord; degree: number; rand: number }[] = [];
  for (const next of cellNeighbors(topology, w, h, cell)) {
    const nKey = cellKey(next);
    if (visited.has(nKey)) continue;
    let degree = 0;
    for (const nb of cellNeighbors(topology, w, h, next)) {
      if (!visited.has(cellKey(nb))) degree++;
    }
    candidates.push({ cell: next, degree, rand: Math.random() });
  }
  candidates.sort((a, b) => a.degree - b.degree || a.rand - b.rand);
  for (const { cell: next } of candidates) {
    if (warnsdorff(topology, next, path, visited, w, h, total, deadline)) return true;
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
