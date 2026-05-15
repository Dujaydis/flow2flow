export type Coord = readonly [row: number, col: number];

export interface Pair {
  readonly color: string;
  readonly a: Coord;
  readonly b: Coord;
}

export interface Level {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly pairs: ReadonlyArray<Pair>;
}

export interface ActiveDrag {
  readonly color: string;
  readonly path: ReadonlyArray<Coord>;
}

export interface GameState {
  readonly level: Level;
  readonly paths: ReadonlyMap<string, ReadonlyArray<Coord>>;
  readonly active: ActiveDrag | null;
}

export type Action =
  | { readonly type: 'LOAD_LEVEL'; readonly level: Level }
  | { readonly type: 'RESET_LEVEL' }
  | { readonly type: 'START_DRAG'; readonly cell: Coord }
  | { readonly type: 'MOVE_TO'; readonly cell: Coord }
  | { readonly type: 'END_DRAG' };
