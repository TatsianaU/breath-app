import { useState, useCallback } from 'react';
import BreathingWave from './BreathingWave';
import { useAmbientSound } from '../hooks/useAmbientSound';

// ─── Sound cycle ─────────────────────────────────────────
const SOUND_CYCLE = [null, 'ocean', 'rain', 'forest'];
const SOUND_ICON  = { null: '🔇', ocean: '🌊', rain: '🌧️', forest: '🌲' };

// ─── Background cycle ────────────────────────────────────
const BG_CYCLE = [null, 'ocean', 'forest', 'mountains'];
const BG_ICON  = { null: '🖼️', ocean: '🌅', forest: '🌿', mountains: '⛰️' };

export default function BreathingScreen({ pattern, duration, onBack }) {
  const [soundIdx, setSoundIdx] = useState(0);
  const [bgIdx, setBgIdx] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finishVisible, setFinishVisible] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const { play, stop } = useAmbientSound();

  const currentSound = SOUND_CYCLE[soundIdx];
  const currentBg = BG_CYCLE[bgIdx];
  const hasBg = currentBg !== null;

  const handleSoundToggle = useCallback(() => {
    const nextIdx = (soundIdx + 1) % SOUND_CYCLE.length;
    const nextSound = SOUND_CYCLE[nextIdx];
    setSoundIdx(nextIdx);

    if (nextSound) play(nextSound);
    else stop();
  }, [soundIdx, play, stop]);

  const handleBgToggle = useCallback(() => {
    setBgIdx((i) => (i + 1) % BG_CYCLE.length);
  }, []);

  const handleFinish = useCallback(() => {
    setIsFinished(true);
    stop();
    setTimeout(() => setFinishVisible(true), 60);
  }, [stop]);

  const handleContinue = useCallback(() => {
    setIsFinished(false);
    setFinishVisible(false);
    setSessionKey((k) => k + 1);
    if (currentSound) play(currentSound);
  }, [currentSound, play]);

  return (
    <div style={styles.screen}>

      {/* Background */}
      {hasBg && (
        <>
          <div
            style={{
              ...styles.bgImage,
              backgroundImage: `url('/assets/images/${currentBg}.jpg')`,
            }}
          />
          <div style={styles.bgOverlay} />
        </>
      )}

      {/* Controls */}
      <div style={styles.controls}>
        <button style={styles.glassBtn} onClick={handleSoundToggle}>
          {SOUND_ICON[currentSound]}
        </button>
        <button style={styles.glassBtn} onClick={handleBgToggle}>
          {BG_ICON[currentBg]}
        </button>
      </div>

      {/* Main card */}
      <div style={styles.glassCard}>
        <p style={styles.patternLabel}>{pattern.label}</p>

        <BreathingWave
          key={sessionKey}
          pattern={pattern}
          duration={duration}
          onBack={onBack}
          onFinish={handleFinish}
          darkBg={hasBg}
          bgType={currentBg}
        />
      </div>

      {/* Finish overlay */}
      {isFinished && (
        <div
          style={{
            ...styles.finishOverlay,
            opacity: finishVisible ? 1 : 0,
            pointerEvents: finishVisible ? 'auto' : 'none',
          }}
        >
          <p style={styles.finishTitle}>Сессия завершена</p>

          <div style={styles.finishBtns}>
            <button style={styles.continueBtn} onClick={handleContinue}>
              Продолжить
            </button>

            <button style={styles.homeBtn} onClick={onBack}>
              На главную
            </button>
          </div>
        </div>
      )}
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
    padding: '2rem 1.5rem',
    gap: '1.5rem',
    position: 'relative',
    background: '#F5F1EB',
    overflow: 'hidden',
  },

  bgImage: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    zIndex: 0,
  },

  bgOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.25)',
    zIndex: 1,
  },

  controls: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    display: 'flex',
    gap: '0.5rem',
    zIndex: 20,
  },

  glassBtn: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(8px)',
    cursor: 'pointer',
  },

  glassCard: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',

    // 🔥 улучшенная читаемость
    background: 'rgba(255,255,255,0.28)',
    backdropFilter: 'blur(18px)',
    borderRadius: '28px',
    border: '1px solid rgba(255,255,255,0.25)',

    padding: '2rem 2.5rem',

    boxShadow: [
      '0 8px 32px rgba(0,0,0,0.2)',
      'inset 0 1px 0 rgba(255,255,255,0.3)',
    ].join(', '),
  },

  patternLabel: {
    fontSize: '0.80rem',

    // 🔥 ключевое изменение
    color: 'rgba(60,70,65,0.85)',

    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    margin: 0,

    // 🔥 делает читаемым на фоне картинок
    textShadow: '0 1px 2px rgba(0,0,0,0.25)',
  },

  finishOverlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    background: 'rgba(245, 241, 235, 0.92)',
    backdropFilter: 'blur(16px)',
    zIndex: 50,
    transition: 'opacity 0.7s ease',
  },

  finishTitle: {
    fontSize: '1.8rem',
    fontWeight: 300,
    color: '#3A3A3A',
    margin: 0,
  },

  finishBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },

  continueBtn: {
    background: 'rgba(168, 195, 209, 0.25)',
    border: '1px solid rgba(168, 195, 209, 0.55)',
    borderRadius: '2rem',
    padding: '0.65rem 2.2rem',
    cursor: 'pointer',
  },

  homeBtn: {
    background: 'none',
    border: 'none',
    color: '#8A8A8A',
    cursor: 'pointer',
  },
};