type Pattern = number | number[];

const canVibrate = (): boolean =>
  typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

const fire = (pattern: Pattern): void => {
  if (!canVibrate()) return;
  try { navigator.vibrate(pattern); } catch { /* */ }
};

export const tapHaptic = (): void => fire(12);
export const connectHaptic = (): void => fire(18);
export const solveHaptic = (): void => fire([20, 60, 30]);
