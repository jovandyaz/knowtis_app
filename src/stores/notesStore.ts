import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS, filterAndSortNotes, generateId } from '@/lib';
import type { CreateNoteInput, Note, UpdateNoteInput } from '@/types';
import { CreateNoteSchema, UpdateNoteSchema } from '@/types';

import { INITIAL_NOTES } from './initialNotes.constants';
import type { NotesStore } from './notesStore.types';

/**
 * Zustand store for managing notes
 * Persisted to localStorage for data persistence
 */
export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      notes: INITIAL_NOTES,
      searchQuery: '',

      createNote: (input: CreateNoteInput) => {
        const validatedInput = CreateNoteSchema.parse(input);

        const now = Date.now();
        const newNote: Note = {
          id: generateId(),
          title: validatedInput.title,
          content: validatedInput.content,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          notes: [newNote, ...state.notes],
        }));

        return newNote;
      },

      updateNote: (id: string, input: UpdateNoteInput) => {
        const validatedInput = UpdateNoteSchema.parse(input);

        let updateSuccessful = false;

        set((state) => {
          const existingNote = state.notes.find((note) => note.id === id);
          if (!existingNote) {
            console.warn(`Note with id "${id}" not found`);
            return state;
          }

          const hasChanges =
            (validatedInput.title !== undefined &&
              validatedInput.title !== existingNote.title) ||
            (validatedInput.content !== undefined &&
              validatedInput.content !== existingNote.content);

          if (!hasChanges) {
            return state;
          }

          updateSuccessful = true;

          return {
            notes: state.notes.map((note) =>
              note.id === id
                ? {
                    ...note,
                    ...validatedInput,
                    updatedAt: Date.now(),
                  }
                : note
            ),
          };
        });

        return updateSuccessful;
      },

      deleteNote: (id: string) => {
        let deleteSuccessful = false;

        set((state) => {
          const noteExists = state.notes.some((note) => note.id === id);
          if (!noteExists) {
            console.warn(`Note with id "${id}" not found for deletion`);
            return state;
          }

          deleteSuccessful = true;

          return {
            notes: state.notes.filter((note) => note.id !== id),
          };
        });

        return deleteSuccessful;
      },

      getNote: (id: string) => {
        return get().notes.find((note) => note.id === id);
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      getFilteredNotes: () => {
        const { notes, searchQuery } = get();
        return filterAndSortNotes(notes, searchQuery);
      },

      resetToInitial: () => {
        set({ notes: INITIAL_NOTES, searchQuery: '' });
      },
    }),
    {
      name: STORAGE_KEYS.NOTES,
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
