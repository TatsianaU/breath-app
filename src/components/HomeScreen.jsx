import { useState } from 'react';
import { PRESET_STATES } from '../utils/getBreathingPattern';

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
        <h1 style={styles.title}>Как ты себя чувствуешь?</h1>
        <p style={styles.subtitle}>Выбери состояние</p>
      </header>

      {/* State chips */}
      <div style={styles.chips}>
        {PRESET_STATES.map((s) => (
          <button
            key={s.id}
            style={{
              ...styles.chip,
              ...(selected === s.id ? styles.chipActive : {}),
            }}
            onClick={() => setSelected(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Duration picker */}
      <div style={styles.durationSection}>
        <p style={styles.durationLabel}>Длительность</p>
        <div style={styles.chips}>
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              style={{
                ...styles.chip,
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
  chip: {
    padding: '0.5rem 1.2rem',
    borderRadius: 999,
    border: '1.5px solid #D6CFC6',
    background: 'transparent',
    color: '#5A5A5A',
    fontSize: '0.88rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '0.02em',
    outline: 'none',
    fontFamily: 'inherit',
  },
  chipActive: {
    background: '#A8C3D1',
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
    border: 'none',
    background: '#A8C3D1',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.04em',
    transition: 'opacity 0.2s ease',
    outline: 'none',
    fontFamily: 'inherit',
  },
  startBtnDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
};
