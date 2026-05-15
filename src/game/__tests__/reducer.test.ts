import { describe, it, expect } from 'vitest';
import { reducer, initialState } from '../reducer';
import type { Level, Pair } from '../types';

const makeLevel = (id: string, width: number, height: number, pairs: Pair[]): Level => ({
  id, width, height, pairs,
  pack: 'Test', numberInPack: 1, displayName: `Test ${id}`,
});

const lvl3x3: Level = makeLevel('t', 3, 3, [
  { color: 'red',  a: [0, 0], b: [2, 2] },
  { color: 'blue', a: [0, 2], b: [2, 0] },
]);

const lvl4x4: Level = makeLevel('t4', 4, 4, [
  { color: 'red',  a: [0, 0], b: [3, 3] },
  { color: 'blue', a: [0, 3], b: [3, 0] },
]);

describe('reducer', () => {
  it('LOAD_LEVEL initializes state', () => {
    const s = reducer(initialState(lvl3x3), { type: 'LOAD_LEVEL', level: lvl3x3 });
    expect(s.level.id).toBe('t');
    expect(s.paths.size).toBe(0);
    expect(s.active).toBeNull();
  });

  it('START_DRAG on endpoint starts a new active path', () => {
    const s = reducer(initialState(lvl3x3), { type: 'START_DRAG', cell: [0, 0] });
    expect(s.active).not.toBeNull();
    expect(s.active?.color).toBe('red');
    expect(s.active?.path).toEqual([[0, 0]]);
  });

  it('START_DRAG on endpoint clears existing committed path', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    s = reducer(s, { type: 'END_DRAG' });
    expect(s.paths.get('red')).toEqual([[0, 0], [0, 1]]);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    expect(s.paths.has('red')).toBe(false);
    expect(s.active?.path).toEqual([[0, 0]]);
  });

  it('START_DRAG on empty cell is ignored', () => {
    const s = reducer(initialState(lvl3x3), { type: 'START_DRAG', cell: [1, 1] });
    expect(s.active).toBeNull();
  });

  it('START_DRAG on body of committed own path rewinds (prefix from endpoint)', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 1] });
    s = reducer(s, { type: 'END_DRAG' });
    expect(s.paths.get('red')).toEqual([[0, 0], [1, 0], [1, 1]]);
    s = reducer(s, { type: 'START_DRAG', cell: [1, 0] });
    expect(s.paths.has('red')).toBe(false);
    expect(s.active?.path).toEqual([[0, 0], [1, 0]]);
  });

  it('MOVE_TO same-as-tail is a no-op', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    const before = s.active;
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 0] });
    expect(s.active).toBe(before);
  });

  it('MOVE_TO to 4-adjacent empty extends', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    expect(s.active?.path).toEqual([[0, 0], [0, 1]]);
  });

  it('MOVE_TO non-adjacent (diagonal) is ignored', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 1] });
    expect(s.active?.path).toEqual([[0, 0]]);
  });

  it('MOVE_TO into another color endpoint is blocked', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [2, 0] });
    expect(s.active?.path).toEqual([[0, 0], [1, 0]]);
  });

  it('MOVE_TO over own trail truncates', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 1] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    expect(s.active?.path).toEqual([[0, 0], [0, 1]]);
  });

  it('MOVE_TO to matching endpoint auto-completes', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 1] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 2] });
    s = reducer(s, { type: 'MOVE_TO', cell: [2, 2] });
    expect(s.active).toBeNull();
    expect(s.paths.get('red')).toEqual([[0, 0], [1, 0], [1, 1], [1, 2], [2, 2]]);
  });

  it('MOVE_TO through other color body truncates the other', () => {
    let s = initialState(lvl4x4);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 3] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 3] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 2] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 1] });
    s = reducer(s, { type: 'END_DRAG' });
    expect(s.paths.get('blue')).toEqual([[0, 3], [1, 3], [1, 2], [1, 1]]);

    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 2] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 2] });
    expect(s.paths.get('blue')).toEqual([[0, 3], [1, 3]]);
    expect(s.active?.path).toEqual([[0, 0], [0, 1], [0, 2], [1, 2]]);
  });

  it('MOVE_TO collision at index 1 truncates other path to just its endpoint', () => {
    let s = initialState(lvl4x4);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 3] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 2] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    s = reducer(s, { type: 'END_DRAG' });
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 1] });
    s = reducer(s, { type: 'MOVE_TO', cell: [1, 2] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 2] });
    expect(s.paths.get('blue')).toEqual([[0, 3]]);
    expect(s.active?.path).toEqual([[0, 0], [1, 0], [1, 1], [1, 2], [0, 2]]);
  });

  it('END_DRAG commits a partial path', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    s = reducer(s, { type: 'END_DRAG' });
    expect(s.active).toBeNull();
    expect(s.paths.get('red')).toEqual([[0, 0], [0, 1]]);
  });

  it('RESET_LEVEL clears paths and active', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [0, 1] });
    s = reducer(s, { type: 'RESET_LEVEL' });
    expect(s.paths.size).toBe(0);
    expect(s.active).toBeNull();
  });

  it('does not move out of bounds', () => {
    let s = initialState(lvl3x3);
    s = reducer(s, { type: 'START_DRAG', cell: [0, 0] });
    s = reducer(s, { type: 'MOVE_TO', cell: [-1, 0] });
    expect(s.active?.path).toEqual([[0, 0]]);
  });
});
