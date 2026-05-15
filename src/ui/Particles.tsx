import { useMemo } from 'react';
import { PALETTE } from '../game/palette';

interface Props {
  count?: number;
}

interface Particle {
  dx: number;
  dy: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
}

export function Particles({ count = 36 }: Props) {
  const particles = useMemo<Particle[]>(() => {
    const out: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 80 + Math.random() * 180;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const entry = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      out.push({
        dx,
        dy,
        color: entry ? entry.hex : '#fff',
        delay: Math.random() * 120,
        duration: 700 + Math.random() * 600,
        size: 6 + Math.random() * 8,
      });
    }
    return out;
  }, [count]);

  return (
    <div className="particles" aria-hidden>
      {particles.map((p, i) => (
        <div
          key={i}
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
  );
}
