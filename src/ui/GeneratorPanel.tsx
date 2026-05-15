import { useState } from 'react';
import { generate } from '../game/generator';
import type { Level } from '../game/types';

interface Props {
  onGenerated: (lvl: Level) => void;
  onPlay: (lvl: Level) => void;
}

export function GeneratorPanel({ onGenerated, onPlay }: Props) {
  const [size, setSize] = useState(6);
  const [pairs, setPairs] = useState(3);
  const [unique, setUnique] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setBusy(true);
    setError(null);
    setTimeout(() => {
      const level = generate({
        width: size,
        height: size,
        pairCount: pairs,
        requireUnique: unique,
        maxAttempts: 80,
      });
      setBusy(false);
      if (!level) {
        setError(`Couldn't find a${unique ? ' unique' : ''} ${size}×${size} with ${pairs} pair${pairs === 1 ? '' : 's'}. Try fewer pairs or a smaller size.`);
        return;
      }
      onGenerated(level);
      onPlay(level);
    }, 30);
  };

  return (
    <div className="generator-panel">
      <h2>Generate a Level</h2>
      <div className="generator-controls">
        <label>
          <span>Size</span>
          <input
            type="number" min="4" max="10"
            value={size}
            onChange={e => setSize(Math.max(4, Math.min(10, Number(e.target.value) || 4)))}
            disabled={busy}
          />
        </label>
        <label>
          <span>Pairs</span>
          <input
            type="number" min="1" max="8"
            value={pairs}
            onChange={e => setPairs(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
            disabled={busy}
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={unique}
            onChange={e => setUnique(e.target.checked)}
            disabled={busy}
          />
          Unique solution
        </label>
        <button onClick={handleGenerate} disabled={busy}>
          {busy ? 'Generating…' : 'Generate'}
        </button>
      </div>
      {error && <div className="generator-error">{error}</div>}
      <p className="generator-hint">
        Generated levels are saved locally and listed above. Larger boards with the "unique" flag may take a moment.
      </p>
    </div>
  );
}
