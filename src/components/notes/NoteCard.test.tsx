import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Note } from '@/types';

import { NoteCard } from './NoteCard';

// Mock TanStack Router's Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({
    children,
    to,
    params,
  }: {
    children: React.ReactNode;
    to: string;
    params?: Record<string, string>;
  }) => {
    const href = params?.noteId ? to.replace('$noteId', params.noteId) : to;
    return <a href={href}>{children}</a>;
  },
}));

describe('NoteCard', () => {
  const mockNote: Note = {
    id: 'test-id-123',
    title: 'Test Note Title',
    content: '<p>This is the <strong>test content</strong> of the note.</p>',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 3600000, // 1 hour ago
  };

  it('should render note title', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);

    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
  });

  it('should render content preview without HTML tags', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);

    // Should show plain text without HTML
    expect(
      screen.getByText(/This is the test content of the note/)
    ).toBeInTheDocument();
  });

  it('should show "No content yet..." for empty content', () => {
    const emptyNote = { ...mockNote, content: '' };
    render(<NoteCard note={emptyNote} onDelete={vi.fn()} />);

    expect(screen.getByText('No content yet...')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const handleDelete = vi.fn();
    const user = userEvent.setup();

    render(<NoteCard note={mockNote} onDelete={handleDelete} />);

    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledWith('test-id-123');
  });

  it('should have a link to the note editor', () => {
    render(<NoteCard note={mockNote} onDelete={vi.fn()} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/notes/test-id-123');
  });
});
