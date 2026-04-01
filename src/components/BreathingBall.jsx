/**
 * 2D guided breathing ball.
 *
 * Two path types:
 *
 * 'vertical' — simple oscillation up ↕ down
 *   inhale  → moves to top    (y: -110px, scale up)
 *   hold    → stays at top    (same position, near-zero transition)
 *   exhale  → moves to bottom (y: +110px, scale down)
 *
 * 'box' — traces a square, one side per phase (4-4-4-4)
 *   inhale  → top-left     (-70, -80)   — side: UP
 *   hold    → top-right    (+70, -80)   — side: RIGHT
 *   exhale  → bottom-right (+70, +80)   — side: DOWN
 *   holdAfterExhale / hold2 → bottom-left  (-70, +80)   — side: LEFT
 *
 * Each CSS transition duration = the phase's breathing duration,
 * so the ball always arrives at its destination exactly when the
 * next phase begins.
 */

/** Target position + scale for each phase, keyed by pathType */
const PATH_STATES = {
  vertical: {
    inhale:  { x:    0, y: -110, scale: 1.40 },
    hold:    { x:    0, y: -110, scale: 1.40 }, // stays at top
    exhale:  { x:    0, y:  110, scale: 0.78 },
    hold2:   { x:    0, y:  110, scale: 0.78 }, // unused for vertical
    idle:    { x:    0, y:    0, scale: 1.00 },
  },
  box: {
    inhale:  { x:  -70, y:  -82, scale: 1.28 }, // UP   → top-left corner
    hold:    { x:   70, y:  -82, scale: 1.28 }, // RIGHT → top-right corner
    exhale:  { x:   70, y:   82, scale: 0.80 }, // DOWN  → bottom-right corner
    hold2:   { x:  -70, y:   82, scale: 0.80 }, // LEFT  → bottom-left corner
    idle:    { x:    0, y:    0, scale: 1.00 },
  },
};

/**
 * Returns the CSS transition duration for this phase.
 *
 * Special case: for 'vertical' hold, the ball is already at its target
 * position (same as end of inhale), so we snap instantly.
 */
function transitionDuration(phase, pattern) {
  const pathType = pattern.pathType ?? 'vertical';
  if (phase === 'hold' && pathType === 'vertical') return 0.05;
  switch (phase) {
    case 'inhale': return pattern.inhale;
    case 'hold':   return pattern.hold;
    case 'exhale': return pattern.exhale;
    case 'hold2':
    case 'holdAfterExhale':
      return pattern.holdAfterExhale ?? pattern.hold2 ?? pattern.hold;
    default:       return 1;
  }
}

export default function BreathingBall({ phase, pattern }) {
  const pathType = pattern.pathType ?? 'vertical';
  const states   = PATH_STATES[pathType] ?? PATH_STATES.vertical;
  const phaseKey = phase === 'holdAfterExhale' ? 'hold2' : phase;
  const { x, y, scale } = states[phaseKey] ?? states.idle;
  const duration = transitionDuration(phase, pattern);

  const style = {
    width: 88,
    height: 88,
    borderRadius: '50%',
    background: 'radial-gradient(circle at 36% 34%, #D3E6EF 0%, #A8C3D1 52%, #87ADBF 100%)',
    boxShadow: `
      0 ${8 + Math.abs(y) * 0.06}px ${28 + Math.abs(y) * 0.1}px rgba(100, 150, 180, 0.20),
      0 2px 8px rgba(100, 150, 180, 0.10)
    `,
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    transition: `transform ${duration}s ease-in-out`,
    willChange: 'transform',
    flexShrink: 0,
  };

  return <div style={style} aria-hidden="true" />;
}
