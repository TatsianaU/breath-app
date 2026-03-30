import { useEffect, useRef, useMemo, useState } from 'react';

/**
 * SINGLE TIME SOURCE: everything derives from (performance.now() - startTime).
 *
 * One RAF loop drives:
 *   • wave scroll (SVG translateX)
 *   • ball vertical position (translateY)
 *   • phase label + phase countdown  (direct DOM writes — no re-renders)
 *   • session countdown timer        (direct DOM write, updates once/second)
 *   • fade-out in final FADE_OUT_S seconds
 *   • end-state trigger (React setState, fires once)
 *
 * This guarantees zero desynchronisation between timer and animation.
 */

// ─── Layout ────────────────────────────────────────────────────────────────
const CW         = 340;
const CH         = 240;
const CENTER_X   = CW / 2;
const CENTER_Y   = CH / 2;
const AMPLITUDE  = 90;
const BALL_SIZE  = 26;
const BALL_R     = BALL_SIZE / 2;

// ─── Wave ──────────────────────────────────────────────────────────────────
const PERIOD_W   = 220;   // pixels per breathing cycle in the SVG
const COPIES     = 12;
const SVG_W      = PERIOD_W * COPIES;

// Initial SVG translateX so ball center aligns with progress=0 at t=0
const ALIGN_N    = Math.ceil(CENTER_X / PERIOD_W);
const INIT_TX    = -(ALIGN_N * PERIOD_W - CENTER_X);

// ─── Timing ────────────────────────────────────────────────────────────────
const FADE_OUT_S = 2.0;   // seconds of fade-out after session ends

// ─── Labels ────────────────────────────────────────────────────────────────
const PHASE_LABELS = { inhale: 'Вдох', hold: 'Задержка', exhale: 'Выдох' };

// ─── Math helpers ──────────────────────────────────────────────────────────

/** Y coordinate for a 0-1 progress through one breathing cycle. */
function waveY(progress, { inhale, hold = 0, exhale }) {
  const total = inhale + hold + exhale;
  const ir    = inhale / total;
  const hr    = hold   / total;

  if (progress <= ir) {
    // Cosine ease: bottom → top
    return CENTER_Y + AMPLITUDE * Math.cos((progress / ir) * Math.PI);
  }
  if (progress <= ir + hr) {
    return CENTER_Y - AMPLITUDE;  // flat at peak
  }
  // Cosine ease: top → bottom
  const t = (progress - ir - hr) / (1 - ir - hr);
  return CENTER_Y - AMPLITUDE * Math.cos(t * Math.PI);
}

/** Phase name + seconds remaining in that phase. */
function phaseAt(progress, { inhale, hold = 0, exhale }) {
  const total = inhale + hold + exhale;
  const ir    = inhale / total;
  const hr    = hold   / total;

  if (progress <= ir) {
    return { phase: 'inhale', remaining: (1 - progress / ir) * inhale };
  }
  if (progress <= ir + hr) {
    const t = (progress - ir) / hr;
    return { phase: 'hold',   remaining: (1 - t) * hold };
  }
  const t = (progress - ir - hr) / (1 - ir - hr);
  return { phase: 'exhale',   remaining: (1 - t) * exhale };
}

/** Format seconds as MM:SS. */
function fmt(totalSec) {
  const s = Math.max(0, Math.ceil(totalSec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Build the repeating wave SVG path (computed once per pattern). */
function buildPath(pattern) {
  const pts = [];
  for (let c = 0; c < COPIES; c++) {
    for (let i = 0; i <= 300; i++) {
      const t = i / 300;
      const x = (c + t) * PERIOD_W;
      const y = waveY(t, pattern);
      pts.push(`${c === 0 && i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  }
  return pts.join(' ');
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function BreathingWave({ pattern, duration, onBack, onFinish, darkBg = false, bgType }) {
  const LINE_COLORS = {
    default: 'rgba(140,210,190,0.95)',
    ocean: 'rgba(35,75,95,0.95)',
  };

  const lineColor =
    bgType === 'ocean' ? LINE_COLORS.ocean : LINE_COLORS.default;

  // DOM refs — updated directly in RAF (no React re-renders on every frame)
  const ballRef    = useRef(null);
  const svgRef     = useRef(null);
  const phaseRef   = useRef(null);
  const countRef   = useRef(null);
  const timerRef   = useRef(null);

  // RAF control
  const rafRef     = useRef(null);
  const t0Ref      = useRef(null);       // performance.now() at session start (ms)

  // Stale-prevention refs for diff-based DOM updates
  const prevPhase  = useRef(null);
  const prevCount  = useRef(null);
  const prevTimer  = useRef(null);
  const finishRef  = useRef(false);
  const cycleRef   = useRef(0);

  // React state — only for infrequent structural changes
  const [cycleCount, setCycleCount]   = useState(0);
  const [isFinished, setIsFinished]   = useState(false);

  const total   = pattern.inhale + (pattern.hold ?? 0) + pattern.exhale;
  const speed   = PERIOD_W / total;     // px/s
  const pathD   = useMemo(() => buildPath(pattern), [pattern]);

  // Initial transforms before first RAF tick
  const initY   = waveY(0, pattern);
  const initBallT = `translateY(${(initY - BALL_R).toFixed(1)}px)`;

  useEffect(() => {
    // Full reset on mount / pattern+duration change
    t0Ref.current    = null;
    prevPhase.current = null;
    prevCount.current = null;
    prevTimer.current = null;
    finishRef.current = false;
    cycleRef.current  = 0;
    setCycleCount(0);
    setIsFinished(false);

    const tick = (ts) => {
      if (!t0Ref.current) t0Ref.current = ts;

      const elapsed  = (ts - t0Ref.current) / 1000;   // seconds
      const timeLeft = duration - elapsed;

      // ── Timer display (updates once per second) ──────────────────────────
      const fmtTimer = fmt(timeLeft);
      if (timerRef.current && fmtTimer !== prevTimer.current) {
        timerRef.current.textContent = fmtTimer;
        prevTimer.current = fmtTimer;
      }

      // ── Fade-out in last FADE_OUT_S seconds ──────────────────────────────
      // Animation continues past zero so the breath completes gracefully.
      let globalOpacity = 1;
      if (elapsed > duration) {
        globalOpacity = Math.max(0, 1 - (elapsed - duration) / FADE_OUT_S);
      }
      if (ballRef.current) ballRef.current.style.opacity = globalOpacity.toFixed(3);
      if (svgRef.current)  svgRef.current.style.opacity  = (globalOpacity * 0.38).toFixed(3);

      // ── Session end ───────────────────────────────────────────────────────
      if (elapsed >= duration + FADE_OUT_S && !finishRef.current) {
        finishRef.current = true;
        cancelAnimationFrame(rafRef.current);
        setIsFinished(true);
        onFinish?.();
        return;
      }

      // ── Breathing cycle ───────────────────────────────────────────────────
      const progress = (elapsed % total) / total;
      const cycle    = Math.floor(elapsed / total);

      if (cycle !== cycleRef.current) {
        cycleRef.current = cycle;
        setCycleCount(cycle);
      }

      // Ball Y
      const by = waveY(progress, pattern);
      if (ballRef.current) {
        ballRef.current.style.transform = `translateY(${(by - BALL_R).toFixed(1)}px)`;
      }

      // Wave scroll — modulo wraps seamlessly because wave is periodic
      const scrolled = (elapsed * speed) % PERIOD_W;
      if (svgRef.current) {
        svgRef.current.style.transform = `translateX(${(INIT_TX - scrolled).toFixed(1)}px)`;
      }

      // Phase label
      const { phase, remaining } = phaseAt(progress, pattern);
      if (phaseRef.current && phase !== prevPhase.current) {
        phaseRef.current.textContent = PHASE_LABELS[phase] ?? '';
        prevPhase.current = phase;
      }
      // Phase countdown
      const countdown = Math.ceil(remaining);
      if (countRef.current && countdown !== prevCount.current) {
        countRef.current.textContent = countdown;
        prevCount.current = countdown;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pattern, duration, total, speed]);

  return (
    <div style={styles.outer}>

      {/* ── Session countdown timer ───────────────────────────────────── */}
      <p ref={timerRef} style={styles.timer}>
        {fmt(duration)}
      </p>

      {/* ── Wave stage ───────────────────────────────────────────────────── */}
      <div style={styles.stage}>

        {/* Scrolling wave path */}
        <svg
          ref={svgRef}
          width={SVG_W}
          height={CH}
          style={{
            ...styles.svg,
            transform: `translateX(${INIT_TX}px)`,
            opacity: darkBg ? 0.8 : 0.66,
          }}
          aria-hidden="true"
        >
          {darkBg && (
            <defs>
              <filter id="wave-glow" x="-10%" y="-80%" width="120%" height="260%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          )}
          {/* Background track — wider, low opacity */}
          <path
            d={pathD}
            fill="none"
            stroke="rgba(140,210,190,0.25)"
            strokeWidth={5}
            opacity={0.18}
          />
          {/* Main guide line */}
          <path
            d={pathD}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.8}
            opacity={1}
            strokeLinecap="round"
            style={{
              filter:
                bgType === 'ocean'
                  ? 'drop-shadow(0 0 6px rgba(35,75,95,0.6))'
                  : 'none',
            }}
          />
        </svg>

        {/* Fixed ball — only Y changes */}
        <div
          ref={ballRef}
          style={{ ...styles.ball, transform: initBallT }}
          aria-hidden="true"
        />

      </div>

      {/* ── Phase + countdown ─────────────────────────────────────────────── */}
      {!isFinished && (
        <div style={styles.textBlock}>
          <p ref={phaseRef}  style={styles.phaseLabel}>{PHASE_LABELS.inhale}</p>
          <p ref={countRef}  style={styles.countdown}>{pattern.inhale}</p>
        </div>
      )}

      <p style={styles.cycleLabel}>
        {isFinished ? null : `Цикл ${cycleCount + 1}`}
      </p>

      {/* ── Back button ───────────────────────────────────────────────────── */}
      <button style={styles.backBtn} onClick={onBack}>
        {isFinished ? '← На главную' : '← Назад'}
      </button>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = {
  outer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  // Large, non-distracting session timer
  timer: {
    fontSize: '2.2rem',
    fontWeight: 200,
    color: '#5A5A5A',
    letterSpacing: '0.06em',
    fontVariantNumeric: 'tabular-nums',
    margin: 0,
    lineHeight: 1,
  },
  stage: {
    position: 'relative',
    width: CW,
    height: CH,
    overflow: 'hidden',
    borderRadius: '22px',
    background: 'transparent',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    willChange: 'transform',
    pointerEvents: 'none',
  },
  ball: {
    position: 'absolute',
    left: CENTER_X - BALL_R,
    top: 0,
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: '50%',
    background:
      'radial-gradient(circle at 36% 34%, #D8ECF4 0%, #A8C3D1 50%, #83AAC0 100%)',
    boxShadow: [
      '0 0 0 6px rgba(168,195,209,0.15)',
      '0 0 20px 9px rgba(168,195,209,0.32)',
      '0 4px 12px rgba(80,130,160,0.22)',
    ].join(', '),
    willChange: 'transform',
    zIndex: 2,
    transition: 'opacity 0.3s ease',
  },
  textBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    minHeight: 64,
  },
  phaseLabel: {
    fontSize: '1.75rem',
    fontWeight: 300,
    color: '#3A3A3A',
    margin: 0,
    letterSpacing: '0.04em',
  },
  countdown: {
    fontSize: '1.05rem',
    color: '#8BAFC2',
    margin: 0,
    fontVariantNumeric: 'tabular-nums',
    minWidth: '1.5ch',
    textAlign: 'center',
  },
  cycleLabel: {
    fontSize: '0.78rem',
    color: '#94AAB6',
    fontWeight: 500,
    margin: 0,
    letterSpacing: '0.08em',
    minHeight: '1em',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#8A8A8A',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    letterSpacing: '0.04em',
    fontFamily: 'inherit',
  },
};
