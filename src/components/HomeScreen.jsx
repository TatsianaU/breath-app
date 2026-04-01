import { useState } from 'react';
import { STATES } from '../utils/getBreathingPattern';

const DURATIONS = [
  { label: '1 мин',  value: 60  },
  { label: '2 мин',  value: 120 },
  { label: '3 мин',  value: 180 },
  { label: '5 мин',  value: 300 },
];

export default function HomeScreen({ onStart }) {
  const [selected,    setSelected]    = useState(null);
  const [duration,    setDuration]    = useState(120); // default 2 min

  const handleStart = () => {
    if (!selected) return;
    onStart(selected, duration);
  };

  const canStart = selected !== null;

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <h1 style={styles.title}>Какое состояние нужно?</h1>
        <p style={styles.subtitle}>Выбери состояние и следуй ритму</p>
      </header>

      {/* State chips */}
      <div className="home-state-chips" style={styles.chipsStates}>
        {STATES.map((s) => (
          <button
            key={s.id}
            style={{
              ...styles.chipState,
              ...(selected === s.id ? styles.chipActive : {}),
            }}
            onClick={() => setSelected(s.id)}
          >
            {s.label}
            <span
              style={
                selected === s.id ? styles.chipDescActive : styles.chipDesc
              }
            >
              {s.patternLabel}
            </span>
          </button>
        ))}
      </div>

      {/* Duration picker */}
      <div style={styles.durationSection}>
        <p style={styles.durationLabel}>Длительность</p>
        <div className="home-duration-chips" style={styles.chips}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              style={{
                ...styles.chipDuration,
                ...(duration === d.value ? styles.chipActive : {}),
              }}
              onClick={() => setDuration(d.value)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <button
        style={{ ...styles.startBtn, ...(canStart ? {} : styles.startBtnDisabled) }}
        onClick={handleStart}
        disabled={!canStart}
      >
        Начать
      </button>
    </div>
  );
}

const chipBase = {
  padding: '0.5rem 1.2rem',
  borderRadius: 999,
  borderWidth: '1.5px',
  borderStyle: 'solid',
  borderColor: '#D6CFC6',
  background: 'transparent',
  color: '#5A5A5A',
  fontSize: '0.88rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  letterSpacing: '0.02em',
  outline: 'none',
  fontFamily: 'inherit',
  appearance: 'none',
  WebkitAppearance: 'none',
};

const styles = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100dvh',
    padding: '2.5rem 1.5rem',
    gap: '1.75rem',
  },
  header: { textAlign: 'center' },
  title: {
    fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
    fontWeight: 300,
    color: '#3A3A3A',
    margin: '0 0 0.5rem',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#8A8A8A',
    margin: 0,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.6rem',
    justifyContent: 'center',
    maxWidth: 380,
  },
  chipsStates: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0.65rem',
    width: '100%',
    maxWidth: 420,
    justifyItems: 'stretch',
  },
  /** Длительность: те же tap/focus/press, что у state-кнопок */
  chipDuration: {
    ...chipBase,
    borderRadius: 999,
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    outlineOffset: 0,
    transition:
      'transform 0.1s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
  },
  chipState: {
    ...chipBase,
    padding: '0.45rem 0.55rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.1rem',
    width: '100%',
    minWidth: 0,
    textAlign: 'center',
    borderRadius: 999,
    overflow: 'hidden',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    outlineOffset: 0,
    transition: 'transform 0.1s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease',
  },
  chipDesc: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 400,
    letterSpacing: '0.06em',
    color: '#9A9A9A',
  },
  chipDescActive: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: 400,
    letterSpacing: '0.06em',
    color: 'rgba(255,255,255,0.82)',
  },
  chipActive: {
    background: '#A8C3D1',
    borderWidth: '1.5px',
    borderStyle: 'solid',
    borderColor: '#A8C3D1',
    color: '#fff',
  },
  durationSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.65rem',
  },
  durationLabel: {
    fontSize: '0.78rem',
    color: '#9A9A9A',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    margin: 0,
  },
  startBtn: {
    padding: '0.8rem 3rem',
    borderRadius: 999,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: 'transparent',
    background: '#A8C3D1',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'opacity 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  startBtnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
};
