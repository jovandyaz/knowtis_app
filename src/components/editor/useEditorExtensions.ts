import { useMemo } from 'react';

import Collaboration from '@tiptap/extension-collaboration';
import Underline from '@tiptap/extension-underline';
import type { Extensions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { WebrtcProvider } from 'y-webrtc';
import type * as Y from 'yjs';

import type { CollaborativeUser } from '@/types';

import { CollaborativeCursors } from './CollaborativeCursors';

/**
 * Hook for configuring Tiptap extensions for collaborative editing
 * @param yDoc - Yjs document instance
 * @param yXmlFragment - Yjs XML fragment for content storage
 * @param provider - WebRTC provider for P2P sync
 * @param currentUser - Current user information
 * @returns Array of configured TipTap extensions
 */
export function useEditorExtensions(
  yDoc: Y.Doc,
  yXmlFragment: Y.XmlFragment,
  provider: WebrtcProvider,
  currentUser: CollaborativeUser
): Extensions {
  return useMemo(
    () => [
      StarterKit.configure({
        undoRedo: false,
        bulletList: {
          HTMLAttributes: { class: 'list-disc list-outside ml-6' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal list-outside ml-6' },
        },
        listItem: {
          HTMLAttributes: { class: 'leading-normal' },
        },
      }),
      Underline,
      Collaboration.configure({
        document: yDoc,
        fragment: yXmlFragment,
      }),
      CollaborativeCursors.configure({
        awareness: provider.awareness,
        user: {
          name: currentUser.name,
          color: currentUser.color,
        },
      }),
    ],
    [
      yDoc,
      yXmlFragment,
      provider.awareness,
      currentUser.name,
      currentUser.color,
    ]
  );
}
