import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { IndexeddbPersistence } from 'y-indexeddb';
import { removeAwarenessStates } from 'y-protocols/awareness';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

import { COLLAB_CONFIG, isInvalidStateError } from '@/lib';
import { BROADCAST_MESSAGE_TYPES } from '@/lib/collaboration.constants';
import type {
  BroadcastMessage,
  CollaborativeUser,
  YjsContextValue,
} from '@/types';

import {
  cleanupResources,
  createInitialUser,
  createMessageHandler,
} from './YjsProvider.helpers';
import { getRoomName } from './YjsProvider.helpers';
import type { DocumentResources, YjsProviderProps } from './YjsProvider.types';

const YjsContext = createContext<YjsContextValue | null>(null);

/**
 * Hook to access Yjs collaboration features
 * @throws Error if used outside YjsProvider
 */
export function useYjs(): YjsContextValue {
  const context = useContext(YjsContext);

  if (!context) {
    throw new Error('useYjs must be used within a YjsProvider');
  }

  return context;
}

export function YjsProvider({ children }: YjsProviderProps) {
  const resourcesRef = useRef<DocumentResources>({
    docs: new Map(),
    persistence: new Map(),
    providers: new Map(),
  });
  const channelRef = useRef<BroadcastChannel | null>(null);

  const [currentUser] = useState<CollaborativeUser>(createInitialUser);
  const [activeUsers, setActiveUsers] = useState<
    Map<string, CollaborativeUser[]>
  >(new Map());

  useEffect(() => {
    channelRef.current = new BroadcastChannel(COLLAB_CONFIG.CHANNEL_NAME);

    const handleMessage = createMessageHandler(
      resourcesRef.current,
      setActiveUsers
    );
    channelRef.current.addEventListener('message', handleMessage);

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setActiveUsers((prev) => {
        const newMap = new Map(prev);
        let hasChanges = false;

        newMap.forEach((users, noteId) => {
          const activeUsers = users.filter((user) => {
            const isStale =
              user.lastSeen &&
              now - user.lastSeen > COLLAB_CONFIG.STALE_USER_TIMEOUT_MS;
            return !isStale;
          });

          if (activeUsers.length !== users.length) {
            hasChanges = true;
            newMap.set(noteId, activeUsers);
          }
        });

        return hasChanges ? newMap : prev;
      });
    }, COLLAB_CONFIG.PRESENCE_INTERVAL_MS);

    return () => {
      clearInterval(cleanupInterval);
      cleanupResources(resourcesRef.current);
      channelRef.current?.removeEventListener('message', handleMessage);
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, []);

  const getYDoc = useCallback((noteId: string): Y.Doc => {
    const resources = resourcesRef.current;
    let doc = resources.docs.get(noteId);

    if (!doc) {
      doc = new Y.Doc();
      resources.docs.set(noteId, doc);

      const persistence = new IndexeddbPersistence(`note-${noteId}`, doc);
      resources.persistence.set(noteId, persistence);

      doc.on('update', (update: Uint8Array) => {
        try {
          channelRef.current?.postMessage({
            type: BROADCAST_MESSAGE_TYPES.UPDATE,
            noteId,
            updates: Array.from(update),
          } satisfies BroadcastMessage);
        } catch (error) {
          if (!isInvalidStateError(error)) {
            console.error('Failed to broadcast document update:', error);
          }
        }
      });
    }

    return doc;
  }, []);

  const getYText = useCallback(
    (noteId: string): Y.XmlFragment => {
      const doc = getYDoc(noteId);
      return doc.getXmlFragment('content');
    },
    [getYDoc]
  );

  const getProvider = useCallback(
    (noteId: string): WebrtcProvider => {
      const resources = resourcesRef.current;
      let provider = resources.providers.get(noteId);

      if (!provider) {
        const doc = getYDoc(noteId);

        provider = new WebrtcProvider(getRoomName(noteId), doc, {
          signaling: [...COLLAB_CONFIG.SIGNALING_SERVERS],
        });

        resources.providers.set(noteId, provider);

        provider.awareness.setLocalStateField('user', {
          name: currentUser.name,
          color: currentUser.color,
        });
      }

      return provider;
    },
    [getYDoc, currentUser.name, currentUser.color]
  );

  const broadcastPresence = useCallback(
    (noteId: string) => {
      try {
        channelRef.current?.postMessage({
          type: BROADCAST_MESSAGE_TYPES.PRESENCE,
          noteId,
          user: currentUser,
        } satisfies BroadcastMessage);
      } catch (error) {
        if (!isInvalidStateError(error)) {
          console.error('Failed to broadcast presence:', error);
        }
      }
    },
    [currentUser]
  );

  const broadcastLeave = useCallback(
    (noteId: string) => {
      try {
        channelRef.current?.postMessage({
          type: BROADCAST_MESSAGE_TYPES.LEAVE,
          noteId,
          user: currentUser,
        } satisfies BroadcastMessage);
      } catch (error) {
        if (!isInvalidStateError(error)) {
          console.error('Failed to broadcast leave:', error);
        }
      }
    },
    [currentUser]
  );

  const clearAwarenessForNote = useCallback((noteId: string) => {
    const provider = resourcesRef.current.providers.get(noteId);
    if (provider?.awareness) {
      provider.awareness.setLocalStateField('cursor', null);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      resourcesRef.current.providers.forEach((provider) => {
        if (provider.awareness) {
          try {
            removeAwarenessStates(
              provider.awareness,
              [provider.awareness.clientID],
              'window unload'
            );
          } catch (error) {
            console.error('Failed to remove awareness state:', error);
          }
        }
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    return () => {
      resourcesRef.current.docs.forEach((_, noteId) => {
        try {
          channelRef.current?.postMessage({
            type: BROADCAST_MESSAGE_TYPES.LEAVE,
            noteId,
            user: currentUser,
          } satisfies BroadcastMessage);
        } catch (error) {
          if (!isInvalidStateError(error)) {
            console.error('Failed to broadcast leave event:', error);
          }
        }
      });
    };
  }, [currentUser]);

  const value = useMemo<YjsContextValue>(
    () => ({
      getYDoc,
      getYText,
      getProvider,
      currentUser,
      activeUsers,
      broadcastPresence,
      broadcastLeave,
      clearAwarenessForNote,
    }),
    [
      getYDoc,
      getYText,
      getProvider,
      currentUser,
      activeUsers,
      broadcastPresence,
      broadcastLeave,
      clearAwarenessForNote,
    ]
  );

  return <YjsContext.Provider value={value}>{children}</YjsContext.Provider>;
}
