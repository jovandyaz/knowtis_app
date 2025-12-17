import type { Note } from '@/types';

/**
 * Normalizes text for comparison by removing accents and converting to lowercase
 * @param text - Text to normalize
 * @returns Normalized text
 */
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filters notes by search query in title and content
 * @param notes - Array of notes to filter
 * @param query - Search query string
 * @returns Filtered notes array (original array if query is empty)
 */
export function filterNotes(notes: Note[], query: string): Note[] {
  const normalizedQuery = normalizeForSearch(query.trim());

  if (!normalizedQuery) return notes;

  return notes.filter(
    (note) =>
      normalizeForSearch(note.title).includes(normalizedQuery) ||
      normalizeForSearch(note.content).includes(normalizedQuery)
  );
}

/**
 * Sorts notes by updatedAt timestamp in descending order (newest first)
 * @param notes - Array of notes to sort
 * @returns New sorted array
 */
export function sortNotesByUpdated(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Filters and sorts notes in a single operation
 * @param notes - Array of notes to process
 * @param query - Search query string
 * @returns Filtered and sorted notes array
 */
export function filterAndSortNotes(notes: Note[], query: string): Note[] {
  return sortNotesByUpdated(filterNotes(notes, query));
}
