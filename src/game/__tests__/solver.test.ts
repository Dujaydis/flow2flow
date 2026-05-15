import { describe, it, expect } from 'vitest';
import { solve, isSolvable } from '../solver';
import { LEVELS } from '../levels';
import type { Level } from '../types';

describe('solver', () => {
  for (const level of LEVELS) {
    it(`finds a solution for starter level ${level.id}`, () => {
      const sols = solve(level, { maxSolutions: 1, timeoutMs: 8000 });
      expect(sols.length).toBeGreaterThanOrEqual(1);
    });
  }

  it('returns no solution for impossible setup (no covering path)', () => {
    const impossible: Level = {
      id: 'imp', width: 2, height: 2,
      pairs: [
        { color: 'red',  a: [0, 0], b: [1, 1] },
        { color: 'blue', a: [0, 1], b: [1, 0] },
      ],
    };
    expect(isSolvable(impossible, 1000)).toBe(false);
  });

  it('solves a tiny 2x2 single pair', () => {
    const tiny: Level = {
      id: 'tiny', width: 2, height: 2,
      pairs: [{ color: 'red', a: [0, 0], b: [1, 0] }],
    };
    const sols = solve(tiny, { maxSolutions: 3, timeoutMs: 1000 });
    expect(sols.length).toBeGreaterThanOrEqual(1);
    const path = sols[0]?.get('red');
    expect(path).toBeDefined();
    expect(path?.length).toBe(4);
  });
});
