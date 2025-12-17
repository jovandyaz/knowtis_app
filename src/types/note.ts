import { z } from 'zod';

/**
 * Zod schema for validating note objects
 */
export const NoteSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200),
  content: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

/**
 * Type representing a note
 */
export type Note = z.infer<typeof NoteSchema>;

/**
 * Zod schema for validating note creation input
 */
export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().optional().default(''),
});

/**
 * Type for creating a new note
 */
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;

/**
 * Zod schema for validating note updates
 */
export const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
});

/**
 * Type for updating an existing note
 */
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
