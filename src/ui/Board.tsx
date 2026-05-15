import { useCallback, useMemo, useRef } from 'react';
import type { Dispatch, PointerEvent as ReactPointerEvent } from 'react';
import type { Action, Coord, GameState } from '../game/types';
import { computeCellViews } from '../game/views';
import { levelInBounds } from '../game/rules';
import { Cell } from './Cell';

interface Props {
  state: GameState;
  dispatch: Dispatch<Action>;
}

const parseCellAttr = (attr: string): Coord | null => {
  const parts = attr.split(',');
  if (parts.length !== 2) return null;
  const r = Number(parts[0]);
  const c = Number(parts[1]);
  if (Number.isNaN(r) || Number.isNaN(c)) return null;
  return [r, c];
};

export function Board({ state, dispatch }: Props) {
  const views = useMemo(() => computeCellViews(state), [state]);
  const { width, height } = state.level;
  const boardRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (cell: Coord, e: ReactPointerEvent) => {
      e.preventDefault();
      const board = boardRef.current;
      if (board && typeof board.setPointerCapture === 'function') {
        try {
          board.setPointerCapture(e.pointerId);
          activePointerId.current = e.pointerId;
        } catch { /* */ }
      }
      dispatch({ type: 'START_DRAG', cell });
    },
    [dispatch]
  );

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent) => {
      if (!state.active) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;
      const cellEl = el.closest('[data-cell]');
      if (!cellEl) return;
      const attr = cellEl.getAttribute('data-cell');
      if (!attr) return;
      const cell = parseCellAttr(attr);
      if (!cell) return;
      dispatch({ type: 'MOVE_TO', cell });
    },
    [state.active, dispatch]
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const board = boardRef.current;
      if (board && activePointerId.current === e.pointerId) {
        try { board.releasePointerCapture(e.pointerId); } catch { /* */ }
        activePointerId.current = null;
      }
      if (state.active) dispatch({ type: 'END_DRAG' });
    },
    [state.active, dispatch]
  );

  const isCube = state.level.topology?.kind === 'cube';
  const faceSize = state.level.topology?.kind === 'cube' ? state.level.topology.faceSize : 0;

  const cells = [];
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (!levelInBounds(state.level, [r, c])) {
        cells.push(<div key={`v${r},${c}`} className="cell void" aria-hidden />);
        continue;
      }
      cells.push(
        <Cell
          key={`${r},${c}`}
          row={r}
          col={c}
          view={views.get(`${r},${c}`)}
          onPointerDown={handlePointerDown}
        />
      );
    }
  }

  return (
    <div
      ref={boardRef}
      className={`board${isCube ? ' cube' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
        ...(isCube ? { ['--face-size' as string]: String(faceSize) } : {}),
      } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {cells}
    </div>
  );
}
