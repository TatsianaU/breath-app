import { useRef, useCallback, useEffect } from 'react';

/**
 * Available ambient sounds — served from /public/assets/sounds/.
 * All sourced from Wikimedia Commons under CC BY-SA 4.0.
 */
export const SOUNDS = {
  ocean:  { src: '/assets/sounds/ocean.mp3',  label: 'Океан' },
  rain:   { src: '/assets/sounds/rain.mp3',   label: 'Дождь' },
  forest: { src: '/assets/sounds/forest.mp3', label: 'Лес'   },
};

export const SOUND_KEYS = Object.keys(SOUNDS);

const TARGET_VOL  = 0.28;
const FADE_IN_MS  = 1800;
const FADE_OUT_MS = 1200;
const STEPS       = 40;

/** Ramps audio.volume from its current value to `target` over `durationMs`. */
function rampVolume(audio, target, durationMs, onDone) {
  const start    = audio.volume;
  const delta    = (target - start) / STEPS;
  const interval = durationMs / STEPS;
  let   step     = 0;

  const iv = setInterval(() => {
    step++;
    const next = start + delta * step;
    audio.volume = Math.max(0, Math.min(1, next));
    if (step >= STEPS) {
      audio.volume = target;
      clearInterval(iv);
      onDone?.();
    }
  }, interval);

  return iv;
}

export function useAmbientSound() {
  /**
   * Audio pool: one HTMLAudioElement per sound, preloaded at mount.
   * Reusing elements avoids re-downloading on repeated toggles.
   */
  const pool      = useRef({});
  const activeKey = useRef(null);
  const fadeIvs   = useRef({});   // active ramp intervals, keyed by sound key

  // Preload all sounds immediately on mount
  useEffect(() => {
    SOUND_KEYS.forEach((key) => {
      const a = new Audio(SOUNDS[key].src);
      a.loop    = true;
      a.preload = 'auto';
      a.volume  = 0;
      pool.current[key] = a;
    });

    return () => {
      // Release all audio resources on unmount
      Object.values(pool.current).forEach((a) => {
        a.pause();
        a.src = '';
      });
      Object.values(fadeIvs.current).forEach(clearInterval);
    };
  }, []);

  const clearFade = useCallback((key) => {
    if (fadeIvs.current[key]) {
      clearInterval(fadeIvs.current[key]);
      delete fadeIvs.current[key];
    }
  }, []);

  /** Fade out + pause a sound. */
  const fadeOut = useCallback((key) => {
    const audio = pool.current[key];
    if (!audio || audio.paused) return;
    clearFade(key);
    fadeIvs.current[key] = rampVolume(audio, 0, FADE_OUT_MS, () => {
      audio.pause();
      clearFade(key);
    });
  }, [clearFade]);

  /**
   * Switch to a new sound.
   * Fades out the currently playing sound (if any, and different),
   * then fades in the new one.
   */
  const play = useCallback((key) => {
    if (!SOUNDS[key]) return;

    // Already playing this key — nothing to do
    if (activeKey.current === key && !pool.current[key]?.paused) return;

    // Fade out previous sound
    if (activeKey.current && activeKey.current !== key) {
      fadeOut(activeKey.current);
    }

    activeKey.current = key;
    const audio = pool.current[key];
    if (!audio) return;

    clearFade(key);

    const startPlay = () => {
      audio.currentTime = 0;
      audio.volume      = 0;
      audio.play().catch(() => { /* blocked by browser policy until user gesture */ });
      fadeIvs.current[key] = rampVolume(audio, TARGET_VOL, FADE_IN_MS, () => clearFade(key));
    };

    if (audio.paused) {
      startPlay();
    } else {
      // Already playing (e.g. rapidly toggled) — just ramp up
      fadeIvs.current[key] = rampVolume(audio, TARGET_VOL, FADE_IN_MS, () => clearFade(key));
    }
  }, [fadeOut, clearFade]);

  /** Fade out whatever is currently playing. */
  const stop = useCallback(() => {
    if (activeKey.current) {
      fadeOut(activeKey.current);
      activeKey.current = null;
    }
  }, [fadeOut]);

  return { play, stop };
}
