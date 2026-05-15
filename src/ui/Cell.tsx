import { memo } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Coord } from '../game/types';
import type { CellView } from '../game/views';
import { colorHex } from '../game/palette';

interface Props {
  row: number;
  col: number;
  view: CellView | undefined;
  onPointerDown: (cell: Coord, e: ReactPointerEvent) => void;
}

function CellImpl({ row, col, view, onPointerDown }: Props) {
  const handlePointerDown = (e: ReactPointerEvent) => {
    onPointerDown([row, col], e);
  };

  const pathColor = view?.pathColor ? colorHex(view.pathColor) : null;
  const endpointColor = view?.endpointColor ? colorHex(view.endpointColor) : null;

  return (
    <div
      data-cell={`${row},${col}`}
      className={`cell${view?.isTail ? ' tail' : ''}`}
      onPointerDown={handlePointerDown}
    >
      {pathColor && (
        <>
          <div className="path-blob" style={{ background: pathColor }} />
          {view?.prevDir && (
            <div className={`path-arm arm-${view.prevDir}`} style={{ background: pathColor }} />
          )}
          {view?.nextDir && (
            <div className={`path-arm arm-${view.nextDir}`} style={{ background: pathColor }} />
          )}
        </>
      )}
      {endpointColor && (
        <div className="endpoint" style={{ background: endpointColor }} />
      )}
    </div>
  );
}

const viewEqual = (a: CellView | undefined, b: CellView | undefined): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.endpointColor === b.endpointColor &&
    a.pathColor === b.pathColor &&
    a.prevDir === b.prevDir &&
    a.nextDir === b.nextDir &&
    a.isTail === b.isTail &&
    a.isActive === b.isActive
  );
};

export const Cell = memo(CellImpl, (prev, next) =>
  prev.row === next.row &&
  prev.col === next.col &&
  prev.onPointerDown === next.onPointerDown &&
  viewEqual(prev.view, next.view)
);
