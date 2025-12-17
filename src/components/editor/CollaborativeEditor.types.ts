import type { WebrtcProvider } from 'y-webrtc';
import type * as Y from 'yjs';

import type { CollaborativeUser } from '@/types';

/**
 * Props for the CollaborativeEditor component
 * @param noteId - The ID of the note
 * @param initialContent - The initial content of the editor
 * @param onUpdate - Function to update the content of the editor
 * @param placeholder - The placeholder text for the editor
 * @param className - The class name for the editor container
 * @param editable - Whether the editor is editable
 */
export interface CollaborativeEditorProps {
  noteId: string;
  initialContent: string;
  onUpdate: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

/**
 * Props for the InternalEditor component
 * @param yDoc - The Yjs document instance
 * @param yXmlFragment - The Yjs XML fragment for storing editor content
 * @param provider - The WebRTC provider for peer-to-peer synchronization
 * @param currentUser - The current user information
 * @param initialContent - The initial content of the editor
 * @param onUpdate - Function to update the content of the editor
 * @param placeholder - The placeholder text for the editor
 * @param editable - Whether the editor is editable
 */
export interface InternalEditorProps {
  yDoc: Y.Doc;
  yXmlFragment: Y.XmlFragment;
  provider: WebrtcProvider;
  currentUser: CollaborativeUser;
  initialContent: string;
  onUpdate: (content: string) => void;
  placeholder: string;
  editable: boolean;
}
