import { beforeEach, describe, expect, it } from 'vitest';

import { useNotesStore } from './notesStore';

describe('notesStore', () => {
  beforeEach(() => {
    useNotesStore.getState().resetToInitial();
  });

  describe('createNote', () => {
    it('should create a new note with title and content', () => {
      const { createNote, notes } = useNotesStore.getState();
      const initialCount = notes.length;

      const newNote = createNote({
        title: 'Test Note',
        content: '<p>Test content</p>',
      });

      const { notes: updatedNotes } = useNotesStore.getState();
      expect(updatedNotes.length).toBe(initialCount + 1);
      expect(newNote.title).toBe('Test Note');
      expect(newNote.content).toBe('<p>Test content</p>');
      expect(newNote.id).toBeDefined();
      expect(newNote.createdAt).toBeDefined();
      expect(newNote.updatedAt).toBeDefined();
    });

    it('should add new note at the beginning of the list', () => {
      const { createNote } = useNotesStore.getState();

      const newNote = createNote({ title: 'First Note', content: '' });

      const { notes } = useNotesStore.getState();
      expect(notes[0].id).toBe(newNote.id);
    });
  });

  describe('updateNote', () => {
    it('should update note title', () => {
      const { notes, updateNote } = useNotesStore.getState();
      const noteId = notes[0].id;

      updateNote(noteId, { title: 'Updated Title' });

      const { notes: updatedNotes } = useNotesStore.getState();
      const updatedNote = updatedNotes.find((n) => n.id === noteId);
      expect(updatedNote?.title).toBe('Updated Title');
    });

    it('should update note content', () => {
      const { notes, updateNote } = useNotesStore.getState();
      const noteId = notes[0].id;

      updateNote(noteId, { content: '<p>New content</p>' });

      const { notes: updatedNotes } = useNotesStore.getState();
      const updatedNote = updatedNotes.find((n) => n.id === noteId);
      expect(updatedNote?.content).toBe('<p>New content</p>');
    });

    it('should update updatedAt timestamp', () => {
      const { notes, updateNote } = useNotesStore.getState();
      const noteId = notes[0].id;
      const originalUpdatedAt = notes[0].updatedAt;

      updateNote(noteId, { title: 'Updated' });

      const { notes: updatedNotes } = useNotesStore.getState();
      const updatedNote = updatedNotes.find((n) => n.id === noteId);
      expect(updatedNote?.updatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    });
  });

  describe('deleteNote', () => {
    it('should remove note from the list', () => {
      const { notes, deleteNote } = useNotesStore.getState();
      const initialCount = notes.length;
      const noteId = notes[0].id;

      deleteNote(noteId);

      const { notes: updatedNotes } = useNotesStore.getState();
      expect(updatedNotes.length).toBe(initialCount - 1);
      expect(updatedNotes.find((n) => n.id === noteId)).toBeUndefined();
    });
  });

  describe('getNote', () => {
    it('should return note by id', () => {
      const { notes, getNote } = useNotesStore.getState();
      const noteId = notes[0].id;

      const note = getNote(noteId);

      expect(note).toBeDefined();
      expect(note?.id).toBe(noteId);
    });

    it('should return undefined for non-existent id', () => {
      const { getNote } = useNotesStore.getState();

      const note = getNote('non-existent-id');

      expect(note).toBeUndefined();
    });
  });

  describe('getFilteredNotes', () => {
    it('should return all notes sorted by updatedAt when no search query', () => {
      const { getFilteredNotes } = useNotesStore.getState();

      const filtered = getFilteredNotes();

      for (let i = 0; i < filtered.length - 1; i++) {
        expect(filtered[i].updatedAt).toBeGreaterThanOrEqual(
          filtered[i + 1].updatedAt
        );
      }
    });

    it('should filter notes by title', () => {
      const { setSearchQuery, getFilteredNotes } = useNotesStore.getState();

      setSearchQuery('Welcome');
      const filtered = getFilteredNotes();

      expect(filtered.length).toBeGreaterThan(0);
      expect(
        filtered.every((n) => n.title.toLowerCase().includes('welcome'))
      ).toBe(true);
    });

    it('should filter notes by content', () => {
      const { setSearchQuery, getFilteredNotes } = useNotesStore.getState();

      setSearchQuery('formatting');
      const filtered = getFilteredNotes();

      expect(filtered.length).toBeGreaterThan(0);
    });
  });
});
