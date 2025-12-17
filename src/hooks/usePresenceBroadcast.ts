import { useEffect } from 'react';

import { COLLAB_CONFIG } from '@/lib';
import { useYjs } from '@/providers';

/**
 * Hook for broadcasting user presence in a collaborative note
 * @param noteId - The ID of the note to broadcast presence for
 */
export function usePresenceBroadcast(noteId: string): void {
  const { broadcastPresence, broadcastLeave } = useYjs();

  useEffect(() => {
    broadcastPresence(noteId);

    const interval = setInterval(
      () => broadcastPresence(noteId),
      COLLAB_CONFIG.PRESENCE_INTERVAL_MS
    );

    return () => {
      clearInterval(interval);
      broadcastLeave(noteId);
    };
  }, [noteId, broadcastPresence, broadcastLeave]);
}
