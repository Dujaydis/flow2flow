interface Props {
  connected: number;
  totalPairs: number;
  coverage: number;
  totalCells: number;
  moves: number;
  bestMoves: number | null;
}

export function HUD({ connected, totalPairs, coverage, totalCells, moves, bestMoves }: Props) {
  const flowPercent = totalCells === 0 ? 0 : Math.round((coverage / totalCells) * 100);
  const allConnected = connected === totalPairs && totalPairs > 0;
  const fullyCovered = coverage === totalCells;
  const showCoverageHint = allConnected && !fullyCovered;

  return (
    <div className="hud" aria-live="polite">
      <div className="hud-stats">
        <div className="hud-stat">
          <div className="hud-label">Pipes</div>
          <div className="hud-value">
            <span className={allConnected ? 'hud-num done' : 'hud-num'}>{connected}</span>
            <span className="hud-sep">/</span>
            <span className="hud-num-total">{totalPairs}</span>
          </div>
        </div>
        <div className="hud-stat">
          <div className="hud-label">Flow</div>
          <div className="hud-value">
            <span className={fullyCovered ? 'hud-num done' : 'hud-num'}>{flowPercent}%</span>
          </div>
        </div>
        <div className="hud-stat">
          <div className="hud-label">Moves</div>
          <div className="hud-value">
            <span className="hud-num">{moves}</span>
            {bestMoves !== null && (
              <span className="hud-best">best {bestMoves}</span>
            )}
          </div>
        </div>
      </div>
      <div className={`hud-hint ${showCoverageHint ? 'visible' : ''}`}>
        Cover every square to solve
      </div>
    </div>
  );
}
