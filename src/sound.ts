let ctx: AudioContext | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const W = window as Window & { webkitAudioContext?: typeof AudioContext };
    const Ctor = window.AudioContext || W.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch { return null; }
  }
  return ctx;
};

const note = (
  c: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainVal = 0.12,
): void => {
  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = now + startOffset;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(gainVal, t + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
};

export const playConnectSound = (): void => {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  note(c, 698.46, 0.0,  0.10, 'sine', 0.10); // F5
  note(c, 880.00, 0.06, 0.14, 'sine', 0.12); // A5
};

export const playSolveSound = (): void => {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  const arpeggio: ReadonlyArray<number> = [523.25, 659.25, 783.99, 1046.50];
  arpeggio.forEach((f, i) => {
    note(c, f, i * 0.08, 0.32, 'sine', 0.13);
    note(c, f * 1.002, i * 0.08, 0.34, 'sine', 0.05);
    note(c, f, i * 0.08 + 0.18, 0.22, 'sine', 0.04);
  });
};

export const playUndoSound = (): void => {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  note(c, 392.0, 0.0, 0.10, 'triangle', 0.07);
};
