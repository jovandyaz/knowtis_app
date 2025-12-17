export const STORAGE_KEYS = {
  NOTES: 'notis:notes',
  THEME: 'notis:theme',
} as const;

export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  AUTO_SAVE: 500,
} as const;

export const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};
