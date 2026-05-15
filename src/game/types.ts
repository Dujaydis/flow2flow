export type Coord = readonly [row: number, col: number];

export interface Pair {
  readonly color: string;
  readonly a: Coord;
  readonly b: Coord;
}

export interface Level {
  readonly id: string;
  readonly displayName: string;
  readonly pack: string;
  readonly numberInPack: number;
  readonly width: number;
  readonly height: number;
  readonly pairs: ReadonlyArray<Pair>;
}

export interface LevelPack {
  readonly id: string;
  readonly name: string;
  readonly levels: ReadonlyArray<Level>;
}

export interface ActiveDrag {
  readonly color: string;
  readonly path: ReadonlyArray<Coord>;
}

export type PathsMap = ReadonlyMap<string, ReadonlyArray<Coord>>;

export interface GameState {
  readonly level: Level;
  readonly paths: PathsMap;
  readonly active: ActiveDrag | null;
  readonly moves: number;
  readonly history: ReadonlyArray<PathsMap>;
  readonly justConnected: ReadonlySet<string>;
}

export type Action =
  | { readonly type: 'LOAD_LEVEL'; readonly level: Level }
  | { readonly type: 'RESET_LEVEL' }
  | { readonly type: 'START_DRAG'; readonly cell: Coord }
  | { readonly type: 'MOVE_TO'; readonly cell: Coord }
  | { readonly type: 'END_DRAG' }
  | { readonly type: 'UNDO' }
  | { readonly type: 'CLEAR_CONNECTED_FLASH' };
