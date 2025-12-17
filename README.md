# Notis App

A real-time collaborative notes application built with React 19, TypeScript, and modern tooling. This app handles concurrent edits efficiently using CRDT (Conflict-free Replicated Data Types) and WebRTC for peer-to-peer synchronization.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)

## Features

- **Create, Edit & Delete Notes**: Full CRUD operations with persistent storage and runtime validation
- **Rich Text Editor**: Bold, italic, underline, bullet lists, and numbered lists
- **Real-time Collaboration**: Multiple browser tabs and users can edit the same note simultaneously
- **Conflict Resolution**: Automatic merge using Yjs CRDT - no data loss
- **Auto-save**: Changes are saved automatically with debounce
- **Search with Unicode Support**: Filter notes by title or content with accent-insensitive search
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Toggle between light and dark themes
- **Collaborative Cursors**: See other users' cursors and selections in real-time
- **Accessibility**: Full keyboard navigation, screen reader support, ARIA attributes

## Tech Stack

| Category          | Technology                  |
| ----------------- | --------------------------- |
| Framework         | React 19 + TypeScript       |
| Build Tool        | Vite 7                      |
| Routing           | TanStack Router             |
| State Management  | Zustand with Zod validation |
| Rich Text Editor  | Tiptap (ProseMirror)        |
| Real-time Sync    | Yjs (CRDT) + y-webrtc       |
| Styling           | Tailwind CSS 4              |
| Animations        | Motion (Framer Motion)      |
| Date Formatting   | date-fns                    |
| Error Handling    | react-error-boundary        |
| Testing           | Vitest + Testing Library    |

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recommended) or npm/yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/jovandyaz/collaborative_notes_app.git
cd collaborative_notes_app
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start the development server

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### 4. Test real-time collaboration

#### Local Collaboration (Multiple Tabs)

1. Open the app in your browser
2. Create or select a note
3. Open the same URL in another browser tab
4. Edit the note in both tabs simultaneously
5. Watch changes sync in real-time via BroadcastChannel API

#### Peer-to-Peer Collaboration (Multiple Users)

1. Open the app in your browser
2. Create or select a note
3. Share the note URL with another user (same network or internet)
4. Both users can edit simultaneously
5. Changes sync via WebRTC signaling servers (y-webrtc-eu.fly.dev, y-webrtc-us.fly.dev)

## Project Structure

### Key Files

- `src/providers/YjsProvider.tsx` - Real-time collaboration engine using Yjs CRDT and WebRTC
- `src/components/editor/CollaborativeEditor.tsx` - Rich text editor with collaborative cursors
- `src/stores/notesStore.ts` - State management with Zod validation
- `src/hooks/useCollaborativeEditor.ts` - Hook for managing collaborative editor state
- `src/lib/constants.ts` - Configuration including WebRTC signaling servers

## Key Features Explained

### 1. Zod Validation

All note operations are validated at runtime using Zod schemas to ensure data integrity:

### 2. Real-time Collaboration

- **Local**: Uses BroadcastChannel API for cross-tab synchronization
- **Remote**: Uses WebRTC with public signaling servers for peer-to-peer connection
- **Conflict-free**: Yjs CRDT ensures eventual consistency without data loss

### 3. Accessibility

- Full keyboard navigation support
- Screen reader friendly with proper ARIA attributes
- Focus management in dialogs
- Proper semantic HTML

### 4. Performance

- Memoized components to prevent unnecessary re-renders
- Debounced search and auto-save
- Lazy-loaded routes
- Selective Zustand subscriptions

### 5. Error Handling

- Error boundaries around collaborative editor
- Graceful fallbacks for failed operations
- Detailed error messages for debugging

## Browser Compatibility

BroadcastChannel API and WebRTC are supported in all modern browsers.

## Documentation

For detailed architecture and technical concepts, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).
