import { useMemo } from 'react';

import { filterAndSortNotes } from '@/lib';
import { useNotesStore } from '@/stores';
import type { Note } from '@/types';

/**
 * Hook for getting filtered and sorted notes
 * @param searchQuery - The search query to filter the notes
 * @returns The filtered and sorted notes
 */
export function useFilteredNotes(searchQuery: string): Note[] {
  const notes = useNotesStore((state) => state.notes);

  return useMemo(() => {
    return filterAndSortNotes(notes, searchQuery);
  }, [notes, searchQuery]);
}
