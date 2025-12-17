import { useEffect, useMemo, useState } from 'react';

import type { WebrtcProvider } from 'y-webrtc';
import type * as Y from 'yjs';

import { COLLAB_CONFIG } from '@/lib';
import { useYjs } from '@/providers';
import type { CollaborativeUser } from '@/types';

/**
 * Return type for useCollaborativeEditor hook
 * @param yDoc - The Yjs document instance
 * @param yXmlFragment - The Yjs XML fragment for storing editor content
 * @param provider - The WebRTC provider for peer-to-peer synchronization
 * @param currentUser - The current user information
 * @param isReady - Whether the editor is ready to be used
 */
interface UseCollaborativeEditorReturn {
  yDoc: Y.Doc;
  yXmlFragment: Y.XmlFragment;
  provider: WebrtcProvider;
  currentUser: CollaborativeUser;
  isReady: boolean;
}

/**
 * Hook for managing collaborative editor state and initialization
 * @param noteId - The ID of the note being edited
 * @returns Collaborative editor state and resources
 */
export function useCollaborativeEditor(
  noteId: string
): UseCollaborativeEditorReturn {
  const { getYDoc, getYText, getProvider, currentUser, clearAwarenessForNote } =
    useYjs();
  const [isReady, setIsReady] = useState<boolean>(false);

  const yDoc = useMemo(() => getYDoc(noteId), [getYDoc, noteId]);
  const provider = useMemo(() => getProvider(noteId), [getProvider, noteId]);
  const yXmlFragment = useMemo(() => getYText(noteId), [getYText, noteId]);

  useEffect(() => {
    if (!provider || !yXmlFragment || !yDoc) return;

    const timer = setTimeout(() => {
      setIsReady(true);
    }, COLLAB_CONFIG.PROVIDER_INIT_DELAY_MS);

    return () => {
      clearTimeout(timer);
      clearAwarenessForNote(noteId);
    };
  }, [provider, yXmlFragment, yDoc, noteId, clearAwarenessForNote]);

  return { yDoc, yXmlFragment, provider, currentUser, isReady };
}
