import { useMemo } from 'react';
import { colorHex } from '../game/palette';

interface Props {
  colorId: string;
  originXPercent: number;
  originYPercent: number;
}

interface Particle {
  dx: number;
  dy: number;
  delay: number;
  size: number;
}

const COUNT = 14;

export function PairBurst({ colorId, originXPercent, originYPercent }: Props) {
  const color = colorHex(colorId);
  const particles = useMemo<Particle[]>(() => {
    const out: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 70;
      out.push({
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        delay: Math.random() * 50,
        size: 5 + Math.random() * 5,
      });
    }
    return out;
  }, []);

  return (
    <div
      className="pair-burst"
      style={{
        left: `${originXPercent}%`,
        top: `${originYPercent}%`,
      }}
      aria-hidden
    >
      {particles.map((p, i) => (
        <div
          key={i}
          className="pair-burst-particle"
          style={{
            background: color,
            width: `${p.size}px`,
            height: `${p.size}px`,
            ['--dx' as string]: `${p.dx}px`,
            ['--dy' as string]: `${p.dy}px`,
            animationDelay: `${p.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
