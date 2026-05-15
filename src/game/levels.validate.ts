import type { Level } from './types';
import { cellKey, coordsEqual, inBounds } from './rules';

export const validateLevel = (level: Level): string[] => {
  const errors: string[] = [];
  if (level.width <= 0 || level.height <= 0) errors.push(`${level.id}: non-positive dimensions`);
  if (level.pairs.length === 0) errors.push(`${level.id}: no pairs`);
  const seen = new Map<string, string>();
  for (const pair of level.pairs) {
    if (coordsEqual(pair.a, pair.b)) {
      errors.push(`${level.id}/${pair.color}: a and b are the same cell`);
    }
    if (!inBounds(pair.a, level.width, level.height)) {
      errors.push(`${level.id}/${pair.color}: endpoint a out of bounds`);
    }
    if (!inBounds(pair.b, level.width, level.height)) {
      errors.push(`${level.id}/${pair.color}: endpoint b out of bounds`);
    }
    for (const ep of [pair.a, pair.b]) {
      const k = cellKey(ep);
      const prev = seen.get(k);
      if (prev) errors.push(`${level.id}: cell ${k} is endpoint for both ${prev} and ${pair.color}`);
      seen.set(k, pair.color);
    }
  }
  return errors;
};

export const validateLevels = (levels: ReadonlyArray<Level>): string[] => {
  const errors: string[] = [];
  for (const lvl of levels) errors.push(...validateLevel(lvl));
  return errors;
};
