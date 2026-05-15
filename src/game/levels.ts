import type { Level, LevelPack } from './types';

const lvl = (
  pack: string,
  numberInPack: number,
  id: string,
  width: number,
  height: number,
  pairs: Level['pairs'],
): Level => ({
  id,
  pack,
  numberInPack,
  displayName: `${pack} · ${numberInPack}`,
  width,
  height,
  pairs,
});

const lvlCube = (
  pack: string,
  numberInPack: number,
  id: string,
  faceSize: number,
  pairs: Level['pairs'],
): Level => ({
  id,
  pack,
  numberInPack,
  displayName: `${pack} · ${numberInPack}`,
  width: 2 * faceSize,
  height: 2 * faceSize,
  pairs,
  topology: { kind: 'cube', faceSize },
});

const bridges: ReadonlyArray<Level> = [
  lvl('Bridges', 1, 'br-1', 5, 5, [
    { color: 'red', a: [0, 0], b: [4, 4] },
  ]),
  lvl('Bridges', 2, 'br-2', 5, 5, [
    { color: 'red',  a: [0, 0], b: [1, 4] },
    { color: 'blue', a: [2, 0], b: [4, 4] },
  ]),
  lvl('Bridges', 3, 'br-3', 5, 5, [
    { color: 'red',    a: [3, 3], b: [4, 4] },
    { color: 'orange', a: [3, 4], b: [2, 4] },
    { color: 'yellow', a: [2, 3], b: [0, 0] },
  ]),
  lvl('Bridges', 4, 'br-4', 5, 5, [
    { color: 'red',    a: [2, 0], b: [4, 3] },
    { color: 'orange', a: [4, 4], b: [0, 3] },
    { color: 'yellow', a: [1, 3], b: [1, 1] },
  ]),
  lvl('Bridges', 5, 'br-5', 5, 5, [
    { color: 'red',    a: [0, 4], b: [1, 0] },
    { color: 'orange', a: [2, 0], b: [4, 3] },
    { color: 'yellow', a: [4, 4], b: [2, 2] },
  ]),
];

const pipeline: ReadonlyArray<Level> = [
  lvl('Pipeline', 1, 'pi-1', 6, 6, [
    { color: 'red',    a: [0, 0], b: [2, 2] },
    { color: 'green',  a: [0, 5], b: [2, 3] },
    { color: 'blue',   a: [5, 0], b: [3, 2] },
    { color: 'yellow', a: [5, 5], b: [3, 3] },
  ]),
  lvl('Pipeline', 2, 'pi-2', 6, 6, [
    { color: 'red',   a: [0, 0], b: [0, 5] },
    { color: 'blue',  a: [2, 0], b: [2, 5] },
    { color: 'green', a: [4, 0], b: [4, 5] },
  ]),
  lvl('Pipeline', 3, 'pi-3', 6, 6, [
    { color: 'red',    a: [3, 0], b: [4, 5] },
    { color: 'orange', a: [4, 4], b: [4, 3] },
    { color: 'yellow', a: [3, 3], b: [3, 5] },
  ]),
  lvl('Pipeline', 4, 'pi-4', 6, 6, [
    { color: 'red',    a: [3, 5], b: [2, 4] },
    { color: 'orange', a: [2, 5], b: [2, 1] },
    { color: 'yellow', a: [2, 2], b: [4, 1] },
    { color: 'green',  a: [4, 2], b: [4, 3] },
  ]),
  lvl('Pipeline', 5, 'pi-5', 6, 6, [
    { color: 'red',    a: [0, 0], b: [1, 0] },
    { color: 'orange', a: [2, 0], b: [5, 4] },
    { color: 'yellow', a: [5, 5], b: [2, 3] },
    { color: 'green',  a: [2, 4], b: [3, 4] },
  ]),
];

const network: ReadonlyArray<Level> = [
  lvl('Network', 1, 'ne-1', 7, 7, [
    { color: 'red',  a: [0, 0], b: [3, 6] },
    { color: 'blue', a: [4, 0], b: [6, 6] },
  ]),
  lvl('Network', 2, 'ne-2', 7, 7, [
    { color: 'red',   a: [0, 0], b: [2, 6] },
    { color: 'blue',  a: [3, 0], b: [4, 6] },
    { color: 'green', a: [5, 0], b: [6, 6] },
  ]),
  lvl('Network', 3, 'ne-3', 7, 7, [
    { color: 'red',    a: [2, 2], b: [0, 0] },
    { color: 'orange', a: [1, 0], b: [1, 3] },
    { color: 'yellow', a: [1, 4], b: [2, 5] },
    { color: 'green',  a: [3, 5], b: [3, 3] },
  ]),
  lvl('Network', 4, 'ne-4', 7, 7, [
    { color: 'red',    a: [0, 4], b: [5, 3] },
    { color: 'orange', a: [5, 4], b: [3, 3] },
    { color: 'yellow', a: [3, 4], b: [2, 4] },
    { color: 'green',  a: [2, 5], b: [3, 5] },
  ]),
  lvl('Network', 5, 'ne-5', 7, 7, [
    { color: 'red',    a: [2, 2], b: [5, 1] },
    { color: 'orange', a: [4, 1], b: [3, 0] },
    { color: 'yellow', a: [3, 1], b: [2, 1] },
    { color: 'green',  a: [2, 0], b: [1, 0] },
    { color: 'cyan',   a: [0, 0], b: [1, 1] },
  ]),
];

const mainframe: ReadonlyArray<Level> = [
  lvl('Mainframe', 1, 'mf-1', 8, 8, [
    { color: 'red',    a: [0, 0], b: [3, 0] },
    { color: 'green',  a: [0, 4], b: [3, 4] },
    { color: 'blue',   a: [4, 0], b: [7, 0] },
    { color: 'yellow', a: [4, 4], b: [7, 4] },
  ]),
  lvl('Mainframe', 2, 'mf-2', 8, 8, [
    { color: 'red',    a: [0, 0], b: [0, 7] },
    { color: 'green',  a: [2, 0], b: [2, 7] },
    { color: 'blue',   a: [4, 0], b: [4, 7] },
    { color: 'yellow', a: [6, 0], b: [6, 7] },
  ]),
  lvl('Mainframe', 3, 'mf-3', 8, 8, [
    { color: 'red',    a: [3, 1], b: [4, 0] },
    { color: 'orange', a: [5, 0], b: [5, 2] },
    { color: 'yellow', a: [6, 2], b: [7, 5] },
    { color: 'green',  a: [6, 5], b: [6, 6] },
    { color: 'cyan',   a: [6, 7], b: [7, 6] },
  ]),
  lvl('Mainframe', 4, 'mf-4', 8, 8, [
    { color: 'red',    a: [1, 2], b: [3, 3] },
    { color: 'orange', a: [4, 3], b: [3, 5] },
    { color: 'yellow', a: [4, 5], b: [3, 6] },
    { color: 'green',  a: [2, 6], b: [7, 5] },
    { color: 'cyan',   a: [7, 4], b: [6, 4] },
  ]),
];

const cube: ReadonlyArray<Level> = [
  lvlCube('Cube', 1, 'cu-1', 3, [
    { color: 'red',    a: [5, 2], b: [4, 2] },
    { color: 'orange', a: [4, 1], b: [2, 2] },
  ]),
  lvlCube('Cube', 2, 'cu-2', 3, [
    { color: 'red',    a: [3, 4], b: [2, 0] },
    { color: 'orange', a: [3, 0], b: [4, 0] },
    { color: 'yellow', a: [5, 0], b: [4, 4] },
  ]),
  lvlCube('Cube', 3, 'cu-3', 4, [
    { color: 'red',    a: [4, 1], b: [4, 6] },
    { color: 'orange', a: [1, 3], b: [2, 3] },
    { color: 'yellow', a: [2, 2], b: [2, 1] },
  ]),
  lvlCube('Cube', 4, 'cu-4', 4, [
    { color: 'red',    a: [5, 4], b: [5, 5] },
    { color: 'orange', a: [4, 5], b: [3, 2] },
    { color: 'yellow', a: [3, 1], b: [6, 3] },
    { color: 'green',  a: [6, 4], b: [6, 7] },
  ]),
];

export const PACKS: ReadonlyArray<LevelPack> = [
  { id: 'bridges',   name: 'Bridges 5×5',    levels: bridges   },
  { id: 'pipeline',  name: 'Pipeline 6×6',   levels: pipeline  },
  { id: 'network',   name: 'Network 7×7',    levels: network   },
  { id: 'mainframe', name: 'Mainframe 8×8',  levels: mainframe },
  { id: 'cube',      name: 'Cube — 3 faces', levels: cube      },
];

export const LEVELS: ReadonlyArray<Level> = PACKS.flatMap(p => p.levels);

export const findLevel = (id: string): Level | undefined =>
  LEVELS.find(l => l.id === id);

export const findPackById = (id: string): LevelPack | undefined =>
  PACKS.find(p => p.id === id);

export const findNextInPack = (level: Level): Level | undefined => {
  const pack = PACKS.find(p => p.levels.some(l => l.id === level.id));
  if (!pack) return undefined;
  const idx = pack.levels.findIndex(l => l.id === level.id);
  if (idx === -1 || idx === pack.levels.length - 1) return undefined;
  return pack.levels[idx + 1];
};
