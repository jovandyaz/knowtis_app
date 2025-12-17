import { AlertTriangle } from 'lucide-react';

import { useNotesStore } from '@/stores';

import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/Dialog';

/**
 * Delete note dialog props interface
 * @property {boolean} open - Whether the dialog is open
 * @property {function} onOpenChange - Function to call when the dialog is opened or closed
 * @property {string | null} noteId - The ID of the note to delete
 * @property {string} noteTitle - The title of the note to delete
 */
interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string | null;
  noteTitle: string;
}

export function DeleteNoteDialog({
  open,
  onOpenChange,
  noteId,
  noteTitle,
}: DeleteNoteDialogProps) {
  const deleteNote = useNotesStore((state) => state.deleteNote);

  const handleDelete = () => {
    if (noteId) {
      deleteNote(noteId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-(--destructive)/10">
              <AlertTriangle className="h-5 w-5 text-(--destructive)" />
            </div>
            <DialogTitle>Delete Note</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete{' '}
            <span className="font-medium text-(--foreground)">
              &quot;{noteTitle}&quot;
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
