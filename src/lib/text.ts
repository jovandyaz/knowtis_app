import { HTML_ENTITIES } from './constants';

/**
 * Decodes HTML entities in a string
 * @param text - Text with HTML entities
 * @returns Text with entities decoded
 */
function decodeHtmlEntities(text: string): string {
  let decoded = text;

  Object.entries(HTML_ENTITIES).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, 'g'), char);
  });

  decoded = decoded.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return decoded;
}

/**
 * Removes HTML tags from a string and decodes HTML entities
 * @param html - HTML string to process
 * @returns String with all HTML tags removed and entities decoded
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';

  const withoutTags = html.replace(/<[^>]*>/g, ' ');

  const decoded = decodeHtmlEntities(withoutTags);

  return decoded;
}

/**
 * Normalizes whitespace by replacing multiple spaces with a single space and trimming
 * @param text - Text to normalize
 * @returns Text with normalized whitespace
 */
export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Truncates text at word boundary to avoid cutting words in half
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text at word boundary
 */
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  let truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > maxLength * 0.8) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated + '...';
}

/**
 * Creates a preview text from HTML content by stripping tags and truncating
 * @param html - HTML content to create preview from
 * @param maxLength - Maximum length of the preview (default: 150)
 * @returns Preview text
 */
export function createPreview(html: string, maxLength = 150): string {
  if (!html) return '';

  const stripped = stripHtmlTags(html);
  const normalized = normalizeWhitespace(stripped);

  if (normalized.length <= maxLength) return normalized;

  return truncateAtWordBoundary(normalized, maxLength);
}
