import { LEVELS } from '../game/levels';
import type { Level } from '../game/types';

interface Props {
  onSelect: (level: Level) => void;
  generatedLevels: ReadonlyArray<Level>;
  onClearGenerated: () => void;
  completed: ReadonlySet<string>;
}

function LevelCard({ level, completed, onSelect }: {
  level: Level;
  completed: boolean;
  onSelect: (l: Level) => void;
}) {
  return (
    <button className="level-card" onClick={() => onSelect(level)}>
      <div className="level-name">{level.id}</div>
      <div className="level-size">{level.width}×{level.height} · {level.pairs.length} pair{level.pairs.length === 1 ? '' : 's'}</div>
      {completed && <div className="checkmark" aria-label="completed">✓</div>}
    </button>
  );
}

export function LevelSelect({ onSelect, generatedLevels, onClearGenerated, completed }: Props) {
  return (
    <div className="level-select">
      <h2>Starter Levels</h2>
      <div className="level-grid">
        {LEVELS.map(lvl => (
          <LevelCard key={lvl.id} level={lvl} completed={completed.has(lvl.id)} onSelect={onSelect} />
        ))}
      </div>
      {generatedLevels.length > 0 && (
        <>
          <div className="section-header">
            <h2>Generated</h2>
            <button className="link-button" onClick={onClearGenerated}>Clear all</button>
          </div>
          <div className="level-grid">
            {generatedLevels.map(lvl => (
              <LevelCard key={lvl.id} level={lvl} completed={completed.has(lvl.id)} onSelect={onSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
