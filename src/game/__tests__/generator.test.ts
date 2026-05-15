import { describe, it, expect } from 'vitest';
import { generate } from '../generator';
import { solve } from '../solver';
import { validateLevel } from '../levels.validate';

describe('generator', () => {
  it('generates a solvable 5x5 with 2 pairs', () => {
    const lvl = generate({ width: 5, height: 5, pairCount: 2, requireUnique: false, maxAttempts: 200 });
    expect(lvl).not.toBeNull();
    if (!lvl) return;
    expect(validateLevel(lvl)).toEqual([]);
    expect(solve(lvl, { maxSolutions: 1, timeoutMs: 3000 }).length).toBeGreaterThanOrEqual(1);
  });

  it('generates a solvable 6x6 with 3 pairs', () => {
    const lvl = generate({ width: 6, height: 6, pairCount: 3, requireUnique: false, maxAttempts: 200 });
    expect(lvl).not.toBeNull();
    if (!lvl) return;
    expect(validateLevel(lvl)).toEqual([]);
  });

  it('returns null when impossible (too many pairs for size)', () => {
    expect(generate({ width: 2, height: 2, pairCount: 5 })).toBeNull();
  });

  it('returns null when pairCount exceeds palette', () => {
    expect(generate({ width: 12, height: 12, pairCount: 15 })).toBeNull();
  });
});
