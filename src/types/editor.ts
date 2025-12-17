/**
 * Text formatting options for the editor
 */
export type TextFormat = 'bold' | 'italic' | 'underline';

/**
 * List formatting types available in the editor
 */
export type ListType = 'bulletList' | 'orderedList';

/**
 * All available toolbar actions
 */
export type ToolbarAction = TextFormat | ListType | 'undo' | 'redo';
