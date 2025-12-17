import { useEffect, useState } from 'react';

import { useYjs } from '@/providers';
import type { AwarenessState, CollaborativeUser } from '@/types';

/**
 * Hook for getting the list of active collaborators from Yjs awareness
 * @param noteId - The ID of the note to get collaborators for
 * @returns Array of active collaborators
 */
export function useActiveCollaborators(noteId: string): CollaborativeUser[] {
  const { getProvider } = useYjs();
  const [collaborators, setCollaborators] = useState<CollaborativeUser[]>([]);

  useEffect(() => {
    const provider = getProvider(noteId);
    const { awareness } = provider;

    const updateCollaborators = () => {
      const states = awareness.getStates() as Map<number, AwarenessState>;
      const localClientId = awareness.clientID;
      const users: CollaborativeUser[] = [];

      states.forEach((state, clientId) => {
        if (clientId === localClientId) return;

        if (state.user?.name && state.user?.color && state.cursor) {
          users.push({
            id: String(clientId),
            name: state.user.name,
            color: state.user.color,
          });
        }
      });

      setCollaborators(users);
    };

    updateCollaborators();

    awareness.on('change', updateCollaborators);

    return () => {
      awareness.off('change', updateCollaborators);
    };
  }, [noteId, getProvider]);

  return collaborators;
}
