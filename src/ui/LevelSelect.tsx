import { useState } from 'react';
import { PACKS } from '../game/levels';
import type { Level, LevelPack } from '../game/types';
import { computeStars } from '../storage';

interface Props {
  onSelect: (level: Level) => void;
  generatedLevels: ReadonlyArray<Level>;
  onClearGenerated: () => void;
  completed: ReadonlySet<string>;
  bests: ReadonlyMap<string, number>;
}

const Stars = ({ count }: { count: number }) => (
  <div className="stars" aria-label={`${count} of 3 stars`}>
    {[0, 1, 2].map(i => (
      <span key={i} className={i < count ? 'star filled' : 'star'}>★</span>
    ))}
  </div>
);

function LevelCard({
  level, completed, bestMoves, onSelect,
}: {
  level: Level;
  completed: boolean;
  bestMoves: number | null;
  onSelect: (l: Level) => void;
}) {
  const stars = completed && bestMoves !== null ? computeStars(bestMoves, level.pairs.length) : 0;
  return (
    <button
      className={`level-card${completed ? ' completed' : ''}`}
      onClick={() => onSelect(level)}
    >
      <div className="level-card-top">
        <span className="level-num">{level.numberInPack}</span>
        {completed && <span className="level-check" aria-label="completed">✓</span>}
      </div>
      <div className="level-card-meta">{level.width}×{level.height}</div>
      {completed && <Stars count={stars} />}
    </button>
  );
}

function PackSection({
  pack, expanded, onToggle, onSelect, completed, bests,
}: {
  pack: LevelPack;
  expanded: boolean;
  onToggle: () => void;
  onSelect: (l: Level) => void;
  completed: ReadonlySet<string>;
  bests: ReadonlyMap<string, number>;
}) {
  const doneCount = pack.levels.filter(l => completed.has(l.id)).length;
  const totalStars = pack.levels.reduce((sum, l) => {
    if (!completed.has(l.id)) return sum;
    const m = bests.get(l.id);
    return sum + (m !== undefined ? computeStars(m, l.pairs.length) : 0);
  }, 0);
  const maxStars = pack.levels.length * 3;

  return (
    <div className={`pack${expanded ? ' open' : ''}`}>
      <button className="pack-header" onClick={onToggle}>
        <div className="pack-title">{pack.name}</div>
        <div className="pack-progress">
          <span>{doneCount}/{pack.levels.length}</span>
          <span className="pack-stars">★ {totalStars}/{maxStars}</span>
          <span className="pack-caret">{expanded ? '▾' : '▸'}</span>
        </div>
      </button>
      {expanded && (
        <div className="level-grid">
          {pack.levels.map(lvl => (
            <LevelCard
              key={lvl.id}
              level={lvl}
              completed={completed.has(lvl.id)}
              bestMoves={bests.get(lvl.id) ?? null}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LevelSelect({
  onSelect, generatedLevels, onClearGenerated, completed, bests,
}: Props) {
  const [openPack, setOpenPack] = useState<string>(PACKS[0]?.id ?? '');
  return (
    <div className="level-select">
      {PACKS.map(pack => (
        <PackSection
          key={pack.id}
          pack={pack}
          expanded={openPack === pack.id}
          onToggle={() => setOpenPack(openPack === pack.id ? '' : pack.id)}
          onSelect={onSelect}
          completed={completed}
          bests={bests}
        />
      ))}
      {generatedLevels.length > 0 && (
        <div className={`pack${openPack === '__gen' ? ' open' : ''}`}>
          <button
            className="pack-header"
            onClick={() => setOpenPack(openPack === '__gen' ? '' : '__gen')}
          >
            <div className="pack-title">Generated</div>
            <div className="pack-progress">
              <span>{generatedLevels.filter(l => completed.has(l.id)).length}/{generatedLevels.length}</span>
              <span className="pack-caret">{openPack === '__gen' ? '▾' : '▸'}</span>
            </div>
          </button>
          {openPack === '__gen' && (
            <>
              <div className="level-grid">
                {generatedLevels.map((lvl, i) => (
                  <LevelCard
                    key={lvl.id}
                    level={{ ...lvl, numberInPack: i + 1 }}
                    completed={completed.has(lvl.id)}
                    bestMoves={bests.get(lvl.id) ?? null}
                    onSelect={onSelect}
                  />
                ))}
              </div>
              <button className="link-button" onClick={onClearGenerated}>
                Clear generated
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
