import { describe, it, expect } from 'vitest';
import { LEVELS, PACKS } from '../levels';
import { solve } from '../solver';
import { validateLevel } from '../levels.validate';
import { levelTotalCells } from '../rules';

describe('levels', () => {
  it('every starter level passes structural validation', () => {
    for (const lvl of LEVELS) {
      expect(validateLevel(lvl), `${lvl.id} validation`).toEqual([]);
    }
  });

  it('every starter level has at least one exact-fill solution', () => {
    for (const lvl of LEVELS) {
      const sols = solve(lvl, { maxSolutions: 1, timeoutMs: 6000 });
      expect(sols.length, `${lvl.id} should be solvable`).toBeGreaterThanOrEqual(1);
      const sol = sols[0];
      if (!sol) continue;
      const covered = new Set<string>();
      for (const path of sol.values()) for (const c of path) covered.add(`${c[0]},${c[1]}`);
      expect(covered.size, `${lvl.id} solution must cover all cells`).toBe(levelTotalCells(lvl));
    }
  });

  it('packs index includes every level exactly once', () => {
    const seen = new Set<string>();
    for (const pack of PACKS) {
      for (const lvl of pack.levels) {
        expect(seen.has(lvl.id)).toBe(false);
        seen.add(lvl.id);
      }
    }
    expect(seen.size).toBe(LEVELS.length);
  });
});
