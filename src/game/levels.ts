import type { Level } from './types';

export const LEVELS: ReadonlyArray<Level> = [
  {
    id: '5x5-solo',
    width: 5, height: 5,
    pairs: [
      { color: 'red', a: [0, 0], b: [4, 4] },
    ],
  },
  {
    id: '5x5-split',
    width: 5, height: 5,
    pairs: [
      { color: 'red',  a: [0, 0], b: [1, 4] },
      { color: 'blue', a: [2, 0], b: [4, 4] },
    ],
  },
  {
    id: '6x6-quadrants',
    width: 6, height: 6,
    pairs: [
      { color: 'red',    a: [0, 0], b: [2, 2] },
      { color: 'green',  a: [0, 5], b: [2, 3] },
      { color: 'blue',   a: [5, 0], b: [3, 2] },
      { color: 'yellow', a: [5, 5], b: [3, 3] },
    ],
  },
  {
    id: '6x6-stripes',
    width: 6, height: 6,
    pairs: [
      { color: 'red',   a: [0, 0], b: [0, 5] },
      { color: 'blue',  a: [2, 0], b: [2, 5] },
      { color: 'green', a: [4, 0], b: [4, 5] },
    ],
  },
  {
    id: '7x7-halves',
    width: 7, height: 7,
    pairs: [
      { color: 'red',  a: [0, 0], b: [3, 6] },
      { color: 'blue', a: [4, 0], b: [6, 6] },
    ],
  },
  {
    id: '7x7-thirds',
    width: 7, height: 7,
    pairs: [
      { color: 'red',   a: [0, 0], b: [2, 6] },
      { color: 'blue',  a: [3, 0], b: [4, 6] },
      { color: 'green', a: [5, 0], b: [6, 6] },
    ],
  },
  {
    id: '8x8-quads',
    width: 8, height: 8,
    pairs: [
      { color: 'red',    a: [0, 0], b: [3, 0] },
      { color: 'green',  a: [0, 4], b: [3, 4] },
      { color: 'blue',   a: [4, 0], b: [7, 0] },
      { color: 'yellow', a: [4, 4], b: [7, 4] },
    ],
  },
  {
    id: '8x8-stripes',
    width: 8, height: 8,
    pairs: [
      { color: 'red',    a: [0, 0], b: [0, 7] },
      { color: 'green',  a: [2, 0], b: [2, 7] },
      { color: 'blue',   a: [4, 0], b: [4, 7] },
      { color: 'yellow', a: [6, 0], b: [6, 7] },
    ],
  },
];

export const findLevel = (id: string): Level | undefined =>
  LEVELS.find(l => l.id === id);
