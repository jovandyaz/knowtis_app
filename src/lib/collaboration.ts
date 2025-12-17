import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from 'unique-names-generator';

import { COLLAB_CONFIG } from './collaboration.constants';

const INSTANCE_ID = crypto.randomUUID();

/**
 * Get the unique instance ID for this page
 */
export function getInstanceId(): string {
  return INSTANCE_ID;
}

/**
 * Generate a random cursor color from the predefined palette
 * @returns A color hex string, or a default color if palette is empty
 */
export function getRandomCursorColor(): string {
  const { CURSOR_COLORS } = COLLAB_CONFIG;
  const randomIndex = Math.floor(Math.random() * CURSOR_COLORS.length);
  return CURSOR_COLORS[randomIndex];
}

/**
 * Generate a unique display name using the unique-names-generator library
 * @param userId - User ID to seed the generator
 * @returns A unique display name
 */
export function generateUserName(userId: string): string {
  if (!userId || userId.length === 0) {
    console.warn('Empty userId provided, using fallback');
    return 'Anonymous User';
  }

  let seed = 0;
  for (let i = 0; i < userId.length; i++) {
    seed = (seed * 31 + userId.charCodeAt(i)) >>> 0;
  }

  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: ' ',
    style: 'capital',
    seed,
  });
}

/**
 * Clamp a position to be within document bounds
 * @param position - The position to clamp
 * @param maxSize - Maximum allowed size
 * @returns Clamped position between 0 and maxSize
 */
export function clampPosition(position: number, maxSize: number): number {
  // Handle negative maxSize
  if (maxSize < 0) {
    console.warn('maxSize is negative, returning 0');
    return 0;
  }

  return Math.min(Math.max(0, position), maxSize);
}

/**
 * Check if an error is a DOMException with InvalidStateError
 * @param error - The error to check
 * @returns True if the error is an InvalidStateError
 */
export function isInvalidStateError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'InvalidStateError';
}
