import type { Action, ActiveDrag, Coord, GameState, Level } from './types';
import {
  coordsEqual,
  endpointColorAt,
  findInPaths,
  inBounds,
  isAdjacent,
} from './rules';

export const initialState = (level: Level): GameState => ({
  level,
  paths: new Map(),
  active: null,
});

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_LEVEL':
      return initialState(action.level);

    case 'RESET_LEVEL':
      return { ...state, paths: new Map(), active: null };

    case 'START_DRAG': {
      const { cell } = action;
      if (!inBounds(cell, state.level.width, state.level.height)) return state;
      const endpointColor = endpointColorAt(state.level, cell);
      if (endpointColor !== null) {
        const newPaths = new Map(state.paths);
        newPaths.delete(endpointColor);
        return {
          ...state,
          paths: newPaths,
          active: { color: endpointColor, path: [cell] },
        };
      }
      const hit = findInPaths(state.paths, cell);
      if (hit) {
        const existing = state.paths.get(hit.color);
        if (!existing) return state;
        const prefix = existing.slice(0, hit.index + 1);
        const newPaths = new Map(state.paths);
        newPaths.delete(hit.color);
        return {
          ...state,
          paths: newPaths,
          active: { color: hit.color, path: prefix },
        };
      }
      return state;
    }

    case 'MOVE_TO': {
      const { cell } = action;
      if (!state.active) return state;
      const { color, path } = state.active;
      if (path.length === 0) return state;
      if (!inBounds(cell, state.level.width, state.level.height)) return state;

      const tail = path[path.length - 1];
      if (!tail) return state;
      if (coordsEqual(tail, cell)) return state;

      const ownIdx = path.findIndex(p => coordsEqual(p, cell));
      if (ownIdx !== -1) {
        const truncated = path.slice(0, ownIdx + 1);
        return { ...state, active: { color, path: truncated } };
      }

      if (!isAdjacent(tail, cell)) return state;

      const cellEndpointColor = endpointColorAt(state.level, cell);
      if (cellEndpointColor !== null && cellEndpointColor !== color) {
        return state;
      }

      let newPaths: ReadonlyMap<string, ReadonlyArray<Coord>> = state.paths;
      const hit = findInPaths(state.paths, cell);
      if (hit && hit.color !== color) {
        const otherPath = state.paths.get(hit.color);
        if (otherPath) {
          const truncated = otherPath.slice(0, hit.index);
          const mut = new Map(state.paths);
          if (truncated.length === 0) mut.delete(hit.color);
          else mut.set(hit.color, truncated);
          newPaths = mut;
        }
      }

      const newPath: ReadonlyArray<Coord> = [...path, cell];
      const start = path[0];

      if (
        cellEndpointColor === color &&
        start &&
        !coordsEqual(cell, start)
      ) {
        const committedPaths = new Map(newPaths);
        committedPaths.set(color, newPath);
        return { ...state, paths: committedPaths, active: null };
      }

      const newActive: ActiveDrag = { color, path: newPath };
      return { ...state, paths: newPaths, active: newActive };
    }

    case 'END_DRAG': {
      if (!state.active) return state;
      const { color, path } = state.active;
      if (path.length === 0) return { ...state, active: null };
      const newPaths = new Map(state.paths);
      newPaths.set(color, path);
      return { ...state, paths: newPaths, active: null };
    }
  }
}
