/**
 * Breathing patterns: [inhale, hold, exhale, hold2?] in seconds.
 *
 * pathType controls 2D ball movement:
 *   'vertical' → ball oscillates up ↕ down
 *   'box'      → ball traces a square: up → right → down → left
 *
 * hold2 is only used with 'box' pathType (the bottom hold of a full 4-4-4-4 cycle).
 */
const PATTERNS = {
  calm:       { inhale: 4, hold: 4,  exhale: 6, label: 'Успокоение',   pathType: 'vertical' },
  deep_calm:  { inhale: 4, hold: 7,  exhale: 8, label: 'Глубокий сон', pathType: 'vertical' },
  box:        { inhale: 4, hold: 4,  exhale: 4, hold2: 4, label: 'Фокус',  pathType: 'box' },
  energize:   { inhale: 2, hold: 0,  exhale: 2, label: 'Энергия',      pathType: 'vertical' },
  stress:     { inhale: 4, hold: 4,  exhale: 8, label: 'Стресс',       pathType: 'vertical' },
};

const STATE_MAP = {
  тревога:       PATTERNS.calm,
  стресс:        PATTERNS.stress,
  фокус:         PATTERNS.box,
  концентрация:  PATTERNS.box,
  сон:           PATTERNS.deep_calm,
  энергия:       PATTERNS.energize,
};

/**
 * Keyword rules for free-text input.
 * Each entry: [keywords[], pattern]. First match wins.
 */
const KEYWORD_RULES = [
  [['тревог', 'волну', 'паник', 'страх', 'беспоко'], PATTERNS.calm],
  [['устал', 'нет энергии', 'нет сил', 'сонн', 'вялост'], PATTERNS.energize],
  [['фокус', 'работ', 'концентр', 'задач'], PATTERNS.box],
  [['сон', 'засн', 'спать', 'бессонниц'], PATTERNS.deep_calm],
  [['стресс', 'напряж', 'давлен'], PATTERNS.stress],
];

export function getBreathingPattern(state) {
  if (!state || typeof state !== 'string') return PATTERNS.calm;
  const normalized = state.toLowerCase().trim();
  if (STATE_MAP[normalized]) return STATE_MAP[normalized];
  for (const [keywords, pattern] of KEYWORD_RULES) {
    if (keywords.some((kw) => normalized.includes(kw))) return pattern;
  }
  return PATTERNS.calm;
}

export const PRESET_STATES = [
  { id: 'тревога',      label: 'Тревога' },
  { id: 'стресс',       label: 'Стресс' },
  { id: 'фокус',        label: 'Фокус' },
  { id: 'сон',          label: 'Сон' },
  { id: 'энергия',      label: 'Энергия' },
];
