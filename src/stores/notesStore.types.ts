import type { CreateNoteInput, Note, UpdateNoteInput } from '@/types';

/**
 * Notes store state interface
 * @interface NotesState
 * @property notes - The list of notes
 * @property searchQuery - The search query for the notes
 */
export interface NotesState {
  notes: Note[];
  searchQuery: string;
}

/**
 * Notes store actions interface
 * @interface NotesActions
 * @property createNote - Create a new note (throws ZodError on validation failure)
 * @property updateNote - Update a note (returns boolean indicating success, throws ZodError on validation failure)
 * @property deleteNote - Delete a note (returns boolean indicating success)
 * @property getNote - Get a note
 * @property setSearchQuery - Set the search query
 * @property getFilteredNotes - Get the filtered notes
 * @property resetToInitial - Reset the notes store to the initial state
 */
export interface NotesActions {
  createNote: (input: CreateNoteInput) => Note;
  updateNote: (id: string, input: UpdateNoteInput) => boolean;
  deleteNote: (id: string) => boolean;
  getNote: (id: string) => Note | undefined;

  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];

  resetToInitial: () => void;
}

export type NotesStore = NotesState & NotesActions;
