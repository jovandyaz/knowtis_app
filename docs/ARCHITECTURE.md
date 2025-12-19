# Architecture & Technical Concepts

This document explains the key architectural decisions and technical concepts implemented in this project.

## Table of Contents

1. [Overview](#overview)
2. [State Management](#state-management)
3. [Real-time Collaboration](#real-time-collaboration)
4. [Rich Text Editor](#rich-text-editor)
5. [Performance Optimizations](#performance-optimizations)
6. [Accessibility](#accessibility)
7. [Error Handling](#error-handling)
8. [Testing Strategy](#testing-strategy)
9. [Design Patterns & Principles](#design-patterns--principles)
10. [Code Quality & Tooling](#code-quality--tooling)

---

## Overview

This project is designed to demonstrate modern React best practices with:

- **Type Safety**: Strict TypeScript with runtime validation using Zod
- **State Management**: Efficient handling with Zustand and persistent storage
- **UI Responsiveness**: Optimized rendering with memoization and lazy loading
- **Concurrent Edit Handling**: CRDT-based conflict resolution with Yjs
- **Accessibility**: WCAG 2.1 Level AA compliance
- **Testing**: Unit and component tests with good coverage

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        Browser Tab 1                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   React UI  │──│   Zustand   │──│   Yjs Y.Doc         │  │
│  │  Components │  │    Store    │  │   (CRDT State)      │  │
│  └─────────────┘  └─────────────┘  └───────────┬─────────┘  │
│                                                │            │
└────────────────────────────────────────────────┼────────────┘
                                                 │
                  ┌──────────────────┬────────────┴──────────────────┐
                  │  BroadcastChannel│   WebRTC (y-webrtc)           │
                  │   (Local tabs)   │   (Remote peers)              │
                  └──────────────────┴────────────┬──────────────────┘
                                                 │
┌────────────────────────────────────────────────┼──────────────┐
│                        Browser Tab 2 / Remote  │              │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────┴─────────┐    │
│  │   React UI  │──│   Zustand   │──│   Yjs Y.Doc         │    │
│  │  Components │  │    Store    │  │   (CRDT State)      │    │
│  └─────────────┘  └─────────────┘  └─────────────────────┘    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## State Management

### Zustand Store

We use [Zustand](https://github.com/pmndrs/zustand) for global state management because:

- **Minimal boilerplate**: No actions, reducers, or providers needed
- **TypeScript-first**: Excellent type inference
- **Middleware support**: Built-in persistence to localStorage
- **Selective subscriptions**: Components only re-render when their slice changes

#### Store Structure

```typescript
// src/stores/notesStore.ts
interface NotesState {
  notes: Note[];
  searchQuery: string;
}

interface NotesActions {
  createNote: (input: CreateNoteInput) => Note;
  updateNote: (id: string, input: UpdateNoteInput) => boolean;
  deleteNote: (id: string) => boolean;
  getNote: (id: string) => Note | undefined;
  setSearchQuery: (query: string) => void;
  getFilteredNotes: () => Note[];
}

type NotesStore = NotesState & NotesActions;
```

#### Runtime Validation with Zod

All store operations validate inputs using Zod schemas to ensure data integrity:

```typescript
// src/types/note.ts
export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  content: z.string(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

export const CreateNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string(),
});

// src/stores/notesStore.ts
createNote: (input: CreateNoteInput) => {
  const validatedInput = CreateNoteSchema.parse(input); // Throws ZodError if invalid
  // ... create note
}
```

#### Persistence

Notes are automatically persisted to `localStorage` using Zustand's `persist` middleware:

```typescript
export const useNotesStore = create<NotesStore>()(
  persist(
    (set, get) => ({
      // ... state and actions
    }),
    {
      name: STORAGE_KEYS.NOTES,
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);
```

---

## Real-time Collaboration

### The Challenge of Concurrent Edits

When multiple users edit the same document simultaneously, conflicts can occur:

```bash
User A: "Hello World" → "Hello Beautiful World"
User B: "Hello World" → "Hello Brave World"

Without conflict resolution: Data loss or corruption
With CRDT: "Hello Beautiful Brave World" (automatic merge)
```

### CRDT (Conflict-free Replicated Data Types)

We use [Yjs](https://yjs.dev/), a high-performance CRDT implementation:

- **Eventual Consistency**: All replicas converge to the same state
- **No Central Server Required**: Works peer-to-peer (but can use servers)
- **Automatic Conflict Resolution**: No manual merge needed
- **Efficient Delta Updates**: Only sync changes, not full documents

#### How It Works

1. Each note has a `Y.Doc` (Yjs document) that tracks all changes
2. Changes are represented as operations (insert, delete) with unique IDs
3. Operations can be applied in any order and still produce the same result
4. The `Y.XmlFragment` type is used for rich text (compatible with Tiptap/ProseMirror)

```typescript
// src/providers/YjsProvider.tsx
const getYDoc = (noteId: string): Y.Doc => {
  let doc = docsRef.current.get(noteId);
  if (!doc) {
    doc = new Y.Doc();
    docsRef.current.set(noteId, doc);

    // Persist to IndexedDB (offline support)
    new IndexeddbPersistence(`note-${noteId}`, doc);

    // Setup WebRTC provider for remote collaboration
    const provider = new WebrtcProvider(
      `${COLLAB_CONFIG.ROOM_PREFIX}-${noteId}`,
      doc,
      {
        signaling: [...COLLAB_CONFIG.SIGNALING_SERVERS], // Fly.dev servers
      }
    );
    providersRef.current.set(noteId, provider);
  }
  return doc;
};
```

### Synchronization Methods

#### 1. Local (Cross-Tab) - BroadcastChannel API

For multiple tabs in the same browser:

```typescript
// Messages sent between tabs
type BroadcastMessage =
  | { type: 'presence-join'; noteId: string; user: CollaborativeUser }
  | { type: 'presence-update'; noteId: string; user: CollaborativeUser }
  | { type: 'presence-leave'; noteId: string; userId: string };

const broadcastChannel = new BroadcastChannel(COLLAB_CONFIG.CHANNEL_NAME);
```

#### 2. Remote (Peer-to-Peer) - WebRTC

For multiple users across devices/networks:

- **Signaling Servers**: `wss://y-webrtc-eu.fly.dev`, `wss://y-webrtc-us.fly.dev`
- **Connection**: WebRTC establishes direct peer-to-peer connections
- **Fallback**: If WebRTC fails, IndexedDB still persists local changes

### Collaborative Cursors & Awareness

Users see each other's cursor positions and selections in real-time:

```typescript
// src/hooks/usePresenceBroadcast.ts
const updatePresence = useCallback(() => {
  if (!editor || !provider) return;

  const { from, to } = editor.state.selection;

  provider.awareness?.setLocalStateField('cursor', {
    anchor: from,
    head: to,
    userId: currentUser.userId,
    userName: currentUser.userName,
    userColor: currentUser.userColor,
  });
}, [editor, provider, currentUser]);
```

---

## Rich Text Editor

### Tiptap + ProseMirror

[Tiptap](https://tiptap.dev/) is a headless rich text editor built on ProseMirror:

- **Extensible**: Add features via extensions
- **Yjs Integration**: Native support for collaborative editing
- **Framework-agnostic**: React adapter available
- **Accessible**: Proper ARIA attributes and keyboard navigation

#### Extensions Used

| Extension       | Purpose                                      |
| --------------- | -------------------------------------------- |
| `StarterKit`    | Basic formatting (bold, italic, lists, etc.) |
| `Underline`     | Underline text formatting                    |
| `Collaboration` | Yjs integration for real-time sync           |
| `Placeholder`   | Show placeholder text when empty             |

#### Editor Configuration

```typescript
// src/components/editor/useEditorExtensions.ts
export function useEditorExtensions(
  yXmlFragment: Y.XmlFragment,
  provider: WebrtcProvider
) {
  return useMemo(
    () => [
      StarterKit.configure({
        history: false, // Yjs handles undo/redo
      }),
      UnderlineExtension,
      Collaboration.configure({
        fragment: yXmlFragment,
      }),
      CollaborationCursor.configure({
        provider,
        user: currentUser,
      }),
      Placeholder.configure({
        placeholder: PLACEHOLDERS.EDITOR,
      }),
    ],
    [yXmlFragment, provider, currentUser]
  );
}
```

---

## Performance Optimizations

### 1. Memoization

Components are memoized to prevent unnecessary re-renders:

```typescript
// src/components/notes/NoteCard.tsx
export const NoteCard = memo(function NoteCard({ note, onDelete }) {
  // Component only re-renders when note or onDelete changes
});
```

**Important**: Callbacks passed to memoized components should be wrapped in `useCallback`:

```typescript
// src/components/notes/NoteList.tsx
const handleDelete = useCallback(
  (id: string) => {
    setDeleteDialogState({ open: true, noteId: id, noteTitle: title });
  },
  [] // No dependencies, stable reference
);
```

### 2. Debouncing

Search and auto-save use debouncing to reduce unnecessary operations:

```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedSearch = useDebounce(searchQuery, DEBOUNCE_DELAYS.SEARCH); // 300ms
```

### 3. Selective Store Subscriptions

Zustand allows subscribing to specific state slices:

```typescript
// Only re-renders when notes change, not when searchQuery changes
const notes = useNotesStore((state) => state.notes);

// Subscribe to multiple slices
const { notes, searchQuery } = useNotesStore((state) => ({
  notes: state.notes,
  searchQuery: state.searchQuery,
}));
```

### 4. Text Processing Optimizations

#### HTML Entity Decoding

```typescript
// src/lib/text.ts
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

function decodeHtmlEntities(html: string): string {
  return html.replace(/&[a-z]+;|&#\d+;/gi, (entity) => {
    return HTML_ENTITIES[entity.toLowerCase()] || entity;
  });
}
```

#### Word-Boundary Truncation

Prevents cutting words mid-way when creating previews:

```typescript
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  let truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // Only truncate at space if it's not too far back (80% of maxLength)
  if (lastSpaceIndex > maxLength * 0.8) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated + '...';
}
```

### 5. Unicode Normalization in Search

Search is accent-insensitive using NFD normalization:

```typescript
// src/lib/filters.ts
function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}

// "café" matches "cafe"
// "naïve" matches "naive"
```

---

## Accessibility

This project follows WCAG 2.1 Level AA guidelines:

### 1. Keyboard Navigation

All interactive elements are keyboard accessible:

- **Tab/Shift+Tab**: Navigate between elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close dialogs
- **Arrow Keys**: Navigate within the editor

### 2. Focus Management

Dialogs implement focus trapping:

```typescript
// src/components/ui/Dialog.tsx
function DialogContent({ children }: DialogContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const focusableElements = contentRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Trap focus within dialog
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    contentRef.current.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      contentRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <div ref={contentRef}>{children}</div>;
}
```

### 3. ARIA Attributes

Proper semantic HTML and ARIA attributes:

```typescript
<Button
  aria-label={`Delete ${note.title}`}
  aria-pressed={isActive}
  aria-disabled={isDisabled}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### 4. Screen Reader Support

- All images have `alt` text
- Form inputs have associated labels
- Error messages are announced
- Loading states are communicated

---

## Error Handling

### 1. Error Boundaries

React Error Boundaries catch rendering errors in components:

```typescript
// src/components/editor/EditorErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';

export function EditorErrorBoundary({ children, onReset }: Props) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}
```

Benefits of `react-error-boundary`:

- Functional approach (no class components)
- Better TypeScript support
- More flexible API
- Built-in reset functionality

### 2. Graceful Degradation

Operations return boolean success indicators:

```typescript
// src/stores/notesStore.ts
updateNote: (id: string, input: UpdateNoteInput): boolean => {
  const validatedInput = UpdateNoteSchema.parse(input);
  let updateSuccessful = false;

  set((state) => {
    const existingNote = state.notes.find((note) => note.id === id);
    if (!existingNote) {
      console.warn(`Note with id "${id}" not found`);
      return state; // No change
    }

    updateSuccessful = true;
    return { notes: state.notes.map(/* ... */) };
  });

  return updateSuccessful;
}
```

### 3. Edge Case Handling

```typescript
// src/lib/date.ts
export function formatNoteDate(timestamp: number): string {
  // Validate timestamp
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    return 'Invalid date';
  }

  // Handle future timestamps
  if (timestamp > Date.now()) {
    return 'Just now';
  }

  const date = new Date(timestamp);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  // ... formatting logic
}
```

---

## Testing Strategy

### Unit Tests

Test individual functions and hooks in isolation:

```typescript
// src/stores/notesStore.test.ts
describe('createNote', () => {
  it('should create a new note with title and content', () => {
    const { createNote, notes } = useNotesStore.getState();
    const newNote = createNote({ title: 'Test', content: '' });

    expect(newNote.title).toBe('Test');
    expect(newNote.content).toBe('');
    expect(newNote.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
  });

  it('should throw ZodError for invalid input', () => {
    const { createNote } = useNotesStore.getState();

    expect(() => {
      createNote({ title: '', content: '' }); // Empty title
    }).toThrow(ZodError);
  });
});
```

### Component Tests

Test UI components with React Testing Library:

```typescript
// src/components/notes/NoteCard.test.tsx
it('should call onDelete when delete button is clicked', async () => {
  const handleDelete = vi.fn();
  const note = { id: '1', title: 'Test', content: '', /* ... */ };

  render(<NoteCard note={note} onDelete={handleDelete} />);

  const deleteButton = screen.getByLabelText('Delete Test');
  await userEvent.click(deleteButton);

  expect(handleDelete).toHaveBeenCalledWith('1');
});
```

### Test Coverage

| Area            | Tests | Coverage Focus                              |
| --------------- | ----- | ------------------------------------------- |
| Notes Store     | 11    | CRUD operations, Zod validation, filtering  |
| Note Components | 5     | NoteCard rendering, delete action           |
| Hooks           | 4     | useDebounce timing, value updates           |

### Running Tests

```bash
# Watch mode (development)
pnpm test

# Single run (CI)
pnpm test:run

# With coverage report
pnpm test:coverage
```

---

## Design Patterns & Principles

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)

Each module has one reason to change:

- `notesStore.ts` - Note data management only
- `YjsProvider.tsx` - Collaboration logic only
- `NoteCard.tsx` - Note display only
- `text.ts` - Text processing utilities only

#### 2. Open/Closed Principle (OCP)

Components are open for extension, closed for modification:

```typescript
// Button component accepts variant prop for different styles
<Button variant="default">Save</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

#### 3. Liskov Substitution Principle (LSP)

Subtypes are substitutable for their base types:

```typescript
// All note-related types properly extend base Note type
type Note = z.infer<typeof NoteSchema>;
type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
```

#### 4. Interface Segregation Principle (ISP)

Interfaces are small and specific:

```typescript
// Separate interfaces for state and actions
interface NotesState { /* ... */ }
interface NotesActions { /* ... */ }
type NotesStore = NotesState & NotesActions;
```

#### 5. Dependency Inversion Principle (DIP)

Components depend on abstractions (hooks, stores), not concretions:

```typescript
// Component doesn't know about localStorage or persistence implementation
const notes = useNotesStore((state) => state.notes);
```

### Other Design Principles

#### DRY (Don't Repeat Yourself)

- Extracted `NavigationLinks` component from duplicated code in `Sidebar`
- Centralized constants in `constants.ts` (PLACEHOLDERS, STORAGE_KEYS, etc.)
- Reusable UI components (`Button`, `Card`, `Dialog`, etc.)

#### KISS (Keep It Simple, Stupid)

- Functions do one thing well
- No over-engineering or premature optimization
- Clear naming conventions

#### YAGNI (You Aren't Gonna Need It)

- No speculative features
- Build what's needed now, not what might be needed later
- Simple solutions over complex ones

### Design Patterns

#### 1. Provider Pattern

Context providers wrap the app to provide global functionality:

```typescript
// src/routes/__root.tsx
<ThemeProvider>
  <YjsProvider>
    <Layout>
      <Outlet />
    </Layout>
  </YjsProvider>
</ThemeProvider>
```

#### 2. Composition Pattern

UI is built by composing small, reusable components:

```typescript
<Card>
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>{content}</CardContent>
</Card>
```

#### 3. Custom Hooks Pattern

Logic extraction into reusable hooks:

```typescript
// src/hooks/useCollaborativeEditor.ts
export function useCollaborativeEditor(noteId: string) {
  const { getYDoc, getYText, getProvider, currentUser, clearAwarenessForNote } = useYjs();
  const [isReady, setIsReady] = useState(false);

  // ... initialization and cleanup logic

  return { yDoc, yXmlFragment, provider, currentUser, isReady };
}
```

---

## Code Quality & Tooling

### TypeScript Configuration

Strict mode enabled for maximum type safety:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2024",
    "lib": ["ES2024", "DOM", "DOM.Iterable"],
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint Configuration

Unified to ES2024 with strict rules:

```javascript
// eslint.config.js
export default tseslint.config({
  languageOptions: {
    ecmaVersion: 2024,
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    // Enforce consistent code style
  },
});
```

### Prettier Configuration

Consistent code formatting:

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

### Build Optimization

Vite provides:

- Fast HMR (Hot Module Replacement)
- Optimized production builds
- Tree-shaking
- Code splitting

---
