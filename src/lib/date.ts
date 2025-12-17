import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format a timestamp for display in note cards
 * @param timestamp - The timestamp to format
 * @returns The formatted date
 */
export function formatNoteDate(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    return 'Invalid date';
  }

  if (timestamp > Date.now()) {
    return 'Just now';
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  const daysDiff = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));

  if (daysDiff < 7) {
    return formatDistanceToNow(date, { addSuffix: true });
  }

  return format(date, 'MMM d, yyyy');
}

/**
 * Format a timestamp for detailed view (e.g., note editor)
 * @param timestamp - The timestamp to format
 * @returns The formatted date
 */
export function formatNoteDateFull(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    return 'Invalid date';
  }

  const date = new Date(timestamp);

  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return format(date, "MMMM d, yyyy 'at' h:mm a");
}
