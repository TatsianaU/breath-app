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
  const [customText,  setCustomText]  = useState('');
  const [duration,    setDuration]    = useState(120); // default 2 min

  const handleStart = () => {
    const value = customText.trim() || selected;
    if (!value) return;
    onStart(value, duration);
  };

  const canStart = customText.trim().length > 0 || selected !== null;

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <h1 style={styles.title}>Как ты себя чувствуешь?</h1>
        <p style={styles.subtitle}>Выбери состояние или опиши своё</p>
      </header>

      {/* State chips */}
      <div style={styles.chips}>
        {PRESET_STATES.map((s) => (
          <button
            key={s.id}
            style={{
              ...styles.chip,
              ...(selected === s.id && !customText ? styles.chipActive : {}),
            }}
            onClick={() => { setSelected(s.id); setCustomText(''); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Free-text input */}
      <div style={styles.inputWrap}>
        <input
          style={styles.input}
          type="text"
          placeholder="Или напиши сам… «волнуюсь перед встречей»"
          value={customText}
          onChange={(e) => {
            setCustomText(e.target.value);
            if (e.target.value) setSelected(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && canStart && handleStart()}
        />
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
  inputWrap: {
    width: '100%',
    maxWidth: 380,
  },
  input: {
    width: '100%',
    padding: '0.85rem 1.1rem',
    borderRadius: 14,
    border: '1.5px solid #D6CFC6',
    background: 'rgba(255,255,255,0.6)',
    fontSize: '0.95rem',
    color: '#3A3A3A',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
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
