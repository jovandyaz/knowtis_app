import { Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

import { CreateNoteDialog } from './CreateNoteDialog';

/**
 * Empty state props interface
 * @property {boolean} hasSearch - Whether the search is active
 */
interface EmptyStateProps {
  hasSearch: boolean;
}

export function EmptyState({ hasSearch }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
        {hasSearch ? (
          <Search className="h-10 w-10 text-muted-foreground/50" />
        ) : (
          <Sparkles className="h-10 w-10 text-primary/50" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-foreground">
        {hasSearch ? 'No notes found' : 'Start your collection'}
      </h3>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {hasSearch
          ? `We couldn't find any notes matching your search. Try a different term.`
          : 'Create your first note to get started capturing your ideas.'}
      </p>
      {!hasSearch && (
        <div className="mt-8">
          <CreateNoteDialog />
        </div>
      )}
    </motion.div>
  );
}
