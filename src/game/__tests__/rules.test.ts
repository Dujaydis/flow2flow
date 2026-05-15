import { describe, it, expect } from 'vitest';
import {
  isAdjacent,
  coordsEqual,
  inBounds,
  cellKey,
  isSolved,
  findInPaths,
  endpointColorAt,
  otherEndpoint,
} from '../rules';
import { initialState } from '../reducer';
import type { Level, Coord } from '../types';

const lvl3x3: Level = {
  id: 't', width: 3, height: 3,
  pack: 'Test', numberInPack: 1, displayName: 'Test t',
  pairs: [
    { color: 'red', a: [0, 0], b: [2, 2] },
    { color: 'blue', a: [0, 2], b: [2, 0] },
  ],
};

const stateOf = (lvl: Level, paths: Map<string, Coord[]>, active: import('../types').ActiveDrag | null = null) => ({
  level: lvl,
  paths,
  active,
  moves: 0,
  history: [],
  justConnected: new Set<string>(),
});

describe('rules', () => {
  it('isAdjacent: 4-adjacent only', () => {
    expect(isAdjacent([0, 0], [0, 1])).toBe(true);
    expect(isAdjacent([0, 0], [1, 0])).toBe(true);
    expect(isAdjacent([0, 0], [1, 1])).toBe(false);
    expect(isAdjacent([0, 0], [0, 2])).toBe(false);
    expect(isAdjacent([0, 0], [0, 0])).toBe(false);
  });

  it('coordsEqual', () => {
    expect(coordsEqual([1, 2], [1, 2])).toBe(true);
    expect(coordsEqual([1, 2], [2, 1])).toBe(false);
  });

  it('inBounds', () => {
    expect(inBounds([0, 0], 3, 3)).toBe(true);
    expect(inBounds([2, 2], 3, 3)).toBe(true);
    expect(inBounds([3, 0], 3, 3)).toBe(false);
    expect(inBounds([-1, 0], 3, 3)).toBe(false);
  });

  it('cellKey is stable string', () => {
    expect(cellKey([3, 4])).toBe('3,4');
  });

  it('endpointColorAt finds the color of endpoints', () => {
    expect(endpointColorAt(lvl3x3, [0, 0])).toBe('red');
    expect(endpointColorAt(lvl3x3, [2, 2])).toBe('red');
    expect(endpointColorAt(lvl3x3, [0, 2])).toBe('blue');
    expect(endpointColorAt(lvl3x3, [1, 1])).toBeNull();
  });

  it('otherEndpoint returns the partner endpoint', () => {
    expect(otherEndpoint(lvl3x3, 'red', [0, 0])).toEqual([2, 2]);
    expect(otherEndpoint(lvl3x3, 'red', [2, 2])).toEqual([0, 0]);
    expect(otherEndpoint(lvl3x3, 'blue', [0, 2])).toEqual([2, 0]);
    expect(otherEndpoint(lvl3x3, 'red', [1, 1])).toBeNull();
  });

  it('findInPaths locates cells in committed paths', () => {
    const paths = new Map<string, Coord[]>();
    paths.set('red', [[0, 0], [0, 1], [0, 2]]);
    expect(findInPaths(paths, [0, 1])).toEqual({ color: 'red', index: 1 });
    expect(findInPaths(paths, [1, 0])).toBeNull();
  });

  it('isSolved: false when paths missing', () => {
    expect(isSolved(initialState(lvl3x3))).toBe(false);
  });

  it('isSolved: false when paths are partial or disconnected', () => {
    const paths = new Map<string, Coord[]>();
    paths.set('red', [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]]);
    paths.set('blue', [[0, 2], [0, 1], [2, 1]]);
    expect(isSolved(stateOf(lvl3x3, paths))).toBe(false);

    const paths2 = new Map<string, Coord[]>();
    paths2.set('red', [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]]);
    paths2.set('blue', [[0, 2], [0, 1], [2, 0]]);
    expect(isSolved(stateOf(lvl3x3, paths2))).toBe(false);
  });

  it('isSolved: true when single color fully covers the grid', () => {
    const lvlSolo: Level = {
      id: 'solo', width: 3, height: 3,
      pack: 'Test', numberInPack: 1, displayName: 'Test solo',
      pairs: [{ color: 'red', a: [0, 0], b: [2, 2] }],
    };
    const paths = new Map<string, Coord[]>();
    paths.set('red', [[0, 0], [0, 1], [0, 2], [1, 2], [1, 1], [1, 0], [2, 0], [2, 1], [2, 2]]);
    expect(isSolved(stateOf(lvlSolo, paths))).toBe(true);
  });

  it('isSolved: with active drag is false', () => {
    const paths = new Map<string, Coord[]>();
    paths.set('red',  [[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]]);
    expect(isSolved(stateOf(lvl3x3, paths, { color: 'blue', path: [[0, 2]] }))).toBe(false);
  });
});
