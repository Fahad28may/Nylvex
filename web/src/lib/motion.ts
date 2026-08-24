export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  reveal: 0.5,
} as const;

export const revealTransition = (delay = 0) => ({
  duration: DURATION.reveal,
  delay,
  ease: EASE_OUT,
});
