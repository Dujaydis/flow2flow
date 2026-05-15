import { useMemo } from 'react';
import { PALETTE } from '../game/palette';

interface Props {
  count?: number;
}

interface Dot {
  dx: number;
  dy: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

interface Streamer {
  x: number;
  rotate: number;
  color: string;
  delay: number;
  duration: number;
  width: number;
  height: number;
}

export function Particles({ count = 36 }: Props) {
  const dots = useMemo<Dot[]>(() => {
    const out: Dot[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 180;
      const entry = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      out.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        color: entry ? entry.hex : '#ffffff',
        delay: Math.random() * 120,
        duration: 700 + Math.random() * 600,
        size: 6 + Math.random() * 8,
      });
    }
    return out;
  }, [count]);

  const streamers = useMemo<Streamer[]>(() => {
    const out: Streamer[] = [];
    const total = 18;
    for (let i = 0; i < total; i++) {
      const entry = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      out.push({
        x: (i / total) * 100 + (Math.random() - 0.5) * 6,
        rotate: Math.random() * 360,
        color: entry ? entry.hex : '#ffffff',
        delay: Math.random() * 250,
        duration: 1400 + Math.random() * 700,
        width: 4 + Math.random() * 3,
        height: 12 + Math.random() * 8,
      });
    }
    return out;
  }, []);

  return (
    <>
      <div className="particles" aria-hidden>
        {dots.map((p, i) => (
          <div
            key={`d${i}`}
            className="particle"
            style={{
              background: p.color,
              width: `${p.size}px`,
              height: `${p.size}px`,
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
              animationDelay: `${p.delay}ms`,
              animationDuration: `${p.duration}ms`,
            } as React.CSSProperties}
          />
        ))}
      </div>
      <div className="streamers" aria-hidden>
        {streamers.map((s, i) => (
          <div
            key={`s${i}`}
            className="streamer"
            style={{
              left: `${s.x}%`,
              background: s.color,
              width: `${s.width}px`,
              height: `${s.height}px`,
              animationDelay: `${s.delay}ms`,
              animationDuration: `${s.duration}ms`,
              ['--rot' as string]: `${s.rotate}deg`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
