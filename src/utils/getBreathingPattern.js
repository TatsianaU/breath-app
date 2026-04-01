/**
 * Breathing timing: inhale, hold (after inhale), exhale, holdAfterExhale (optional).
 * Legacy: hold2 is accepted as an alias for holdAfterExhale in formatBreathingPattern.
 *
 * pathType: 'vertical' | 'box' (2D ball guide only).
 */

/** Legacy / alternate ids → canonical state id */
const PRESET_ID_ALIASES = {
  тревога: 'calm',
  стресс: 'calm',
  фокус: 'focus',
  концентрация: 'focus',
  stabilization: 'stability',
  стабилизация: 'stability',
  сон: 'relax',
  энергия: 'energy',
};

/**
 * Состояния: цель сессии, не «диагноз». Каждый режим — уникальный паттерн.
 * @type {Array<{
 *   id: string,
 *   label: string,
 *   pattern: object,
 *   patternLabel: string
 * }>}
 */
export const STATES = [
  {
    id: 'clarity',
    label: 'Ясность',
    pattern: { inhale: 4, exhale: 6, pathType: 'vertical' },
    patternLabel: '4–6',
  },
  {
    id: 'calm',
    label: 'Спокойствие',
    pattern: { inhale: 4, hold: 4, exhale: 6, pathType: 'vertical' },
    patternLabel: '4–4–6',
  },
  {
    id: 'focus',
    label: 'Фокус',
    pattern: { inhale: 4, hold: 2, exhale: 4, pathType: 'vertical' },
    patternLabel: '4–2–4',
  },
  {
    id: 'stability',
    label: 'Стабильность',
    pattern: {
      inhale: 4,
      hold: 4,
      exhale: 4,
      holdAfterExhale: 4,
      pathType: 'box',
    },
    patternLabel: '4–4–4–4',
  },
  {
    id: 'relax',
    label: 'Расслабление',
    pattern: { inhale: 4, hold: 7, exhale: 8, pathType: 'vertical' },
    patternLabel: '4–7–8',
  },
  {
    id: 'energy',
    label: 'Энергия',
    pattern: { inhale: 2, hold: 1, exhale: 2, pathType: 'vertical' },
    patternLabel: '2–1–2',
  },
];

/** @deprecated используйте STATES */
export const PRESET_STATES = STATES;

const PRESET_BY_ID = new Map(STATES.map((s) => [s.id, s]));

/**
 * Keyword rules for free-text resolution. Value = canonical state id.
 * First match wins.
 */
const KEYWORD_RULES = [
  [['ясн', 'чётк', 'четк'], 'clarity'],
  [['спокой', 'угомон', 'тревог', 'волну', 'паник', 'страх'], 'calm'],
  [['фокус', 'концентр', 'работ', 'задач'], 'focus'],
  [['стабиль', 'собран', 'квадрат', 'равновес'], 'stability'],
  [['расслаб', 'сон', 'засн', 'спать', 'бессонниц'], 'relax'],
  [['устал', 'нет сил', 'нет энерг', 'энерг', 'бодр', 'сонн', 'вялост'], 'energy'],
  [['стресс', 'напряж', 'давлен'], 'calm'],
];

function resolvePresetId(state) {
  if (!state || typeof state !== 'string') return 'clarity';
  const normalized = state.toLowerCase().trim();
  const aliased = PRESET_ID_ALIASES[normalized] ?? normalized;
  if (PRESET_BY_ID.has(aliased)) return aliased;
  for (const [keywords, presetId] of KEYWORD_RULES) {
    if (keywords.some((kw) => normalized.includes(kw))) return presetId;
  }
  return 'clarity';
}

export function getPreset(state) {
  const id = resolvePresetId(state);
  return PRESET_BY_ID.get(id) ?? STATES[0];
}

/** Pattern object passed to BreathingWave (timing + pathType only). */
export function presetToEnginePattern(preset) {
  const p = preset.pattern;
  const out = {
    inhale: p.inhale,
    hold: p.hold ?? 0,
    exhale: p.exhale,
    pathType: p.pathType ?? 'vertical',
  };
  const hae = p.holdAfterExhale ?? p.hold2;
  if (typeof hae === 'number' && hae > 0) out.holdAfterExhale = hae;
  return out;
}

export function getBreathingPattern(state) {
  return presetToEnginePattern(getPreset(state));
}

export function getPresetMeta(state) {
  const preset = getPreset(state);
  const pl = preset.patternLabel ?? '';
  return {
    label: preset.label,
    description: pl ? `дыхание ${pl}` : '',
  };
}

/**
 * Human-readable timing key from a runtime/engine pattern.
 * Appends holdAfterExhale (or legacy hold2) when present.
 */
export function formatBreathingPattern(pattern) {
  if (!pattern || typeof pattern.inhale !== 'number' || typeof pattern.exhale !== 'number') {
    return '';
  }
  const parts = [pattern.inhale];
  const hold = pattern.hold ?? 0;
  if (hold > 0) parts.push(hold);
  parts.push(pattern.exhale);
  const holdAfter = pattern.holdAfterExhale ?? pattern.hold2;
  if (typeof holdAfter === 'number' && holdAfter > 0) parts.push(holdAfter);
  return parts.join('-');
}
