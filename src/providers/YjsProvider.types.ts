import type { ReactNode } from 'react';

import type { IndexeddbPersistence } from 'y-indexeddb';
import type { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';

/**
 * Yjs provider props interface
 * @property {ReactNode} children - The content to display in the yjs provider
 */
export interface YjsProviderProps {
  children: ReactNode;
}

/**
 * Document resources interface
 * @property {Map<string, Y.Doc>} docs - The map of documents
 * @property {Map<string, IndexeddbPersistence>} persistence - The map of persistence
 * @property {Map<string, WebrtcProvider>} providers - The map of providers
 */
export interface DocumentResources {
  docs: Map<string, Y.Doc>;
  persistence: Map<string, IndexeddbPersistence>;
  providers: Map<string, WebrtcProvider>;
}
