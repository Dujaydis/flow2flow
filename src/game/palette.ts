export interface PaletteEntry {
  readonly id: string;
  readonly hex: string;
  readonly label: string;
}

export const PALETTE: readonly PaletteEntry[] = [
  { id: 'red',    hex: '#D55E00', label: 'Vermillion' },
  { id: 'orange', hex: '#E69F00', label: 'Orange' },
  { id: 'yellow', hex: '#F0E442', label: 'Yellow' },
  { id: 'green',  hex: '#009E73', label: 'Green' },
  { id: 'cyan',   hex: '#56B4E9', label: 'Sky Blue' },
  { id: 'blue',   hex: '#0072B2', label: 'Blue' },
  { id: 'purple', hex: '#CC79A7', label: 'Purple' },
  { id: 'pink',   hex: '#FF6EC7', label: 'Pink' },
  { id: 'lime',   hex: '#93C572', label: 'Lime' },
  { id: 'brown',  hex: '#8B4513', label: 'Brown' },
];

const HEX_BY_ID = new Map(PALETTE.map(p => [p.id, p.hex]));

export const colorHex = (id: string): string => HEX_BY_ID.get(id) ?? '#888888';

export const PALETTE_IDS: readonly string[] = PALETTE.map(p => p.id);
