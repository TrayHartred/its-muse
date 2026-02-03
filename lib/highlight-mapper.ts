import { Tactic } from './schemas';

export interface HighlightRange {
  start: number;
  end: number;
  tacticIndex: number;
}

/**
 * Find the position of a quote in the original text
 *
 * Uses fuzzy matching to handle minor differences:
 * - Whitespace normalization
 * - Case-insensitive fallback
 */
export function findQuotePosition(
  text: string,
  quote: string
): { start: number; end: number } | null {
  if (!quote || !text) return null;

  // Direct match first
  const directIndex = text.indexOf(quote);
  if (directIndex !== -1) {
    return { start: directIndex, end: directIndex + quote.length };
  }

  // Normalize whitespace and try again
  const normalizedText = text.replace(/\s+/g, ' ');
  const normalizedQuote = quote.replace(/\s+/g, ' ');

  const normalizedIndex = normalizedText.indexOf(normalizedQuote);
  if (normalizedIndex !== -1) {
    // Map back to original positions (approximate)
    let originalStart = 0;
    let normalizedPos = 0;

    for (let i = 0; i < text.length && normalizedPos < normalizedIndex; i++) {
      if (!/\s/.test(text[i]) || (i === 0 || !/\s/.test(text[i - 1]))) {
        normalizedPos++;
      }
      originalStart = i + 1;
    }

    // Find end position
    let originalEnd = originalStart;
    let matchLen = 0;
    for (let i = originalStart; i < text.length && matchLen < normalizedQuote.length; i++) {
      if (!/\s/.test(text[i]) || (i === originalStart || !/\s/.test(text[i - 1]))) {
        matchLen++;
      }
      originalEnd = i + 1;
    }

    return { start: originalStart, end: originalEnd };
  }

  // Case-insensitive fallback
  const lowerText = text.toLowerCase();
  const lowerQuote = quote.toLowerCase();
  const lowerIndex = lowerText.indexOf(lowerQuote);

  if (lowerIndex !== -1) {
    return { start: lowerIndex, end: lowerIndex + quote.length };
  }

  // Substring search (in case quote is slightly truncated)
  if (quote.length > 20) {
    const substring = quote.slice(5, -5);
    const substringIndex = text.indexOf(substring);
    if (substringIndex !== -1) {
      return {
        start: Math.max(0, substringIndex - 5),
        end: Math.min(text.length, substringIndex + substring.length + 5)
      };
    }
  }

  return null;
}

/**
 * Map all tactics to their positions in the text
 *
 * Returns ranges sorted by start position, with overlaps resolved
 */
export function mapTacticsToHighlights(
  text: string,
  tactics: Tactic[]
): HighlightRange[] {
  const ranges: HighlightRange[] = [];

  tactics.forEach((tactic, index) => {
    const position = findQuotePosition(text, tactic.quote);
    if (position) {
      ranges.push({
        start: position.start,
        end: position.end,
        tacticIndex: index,
      });
    }
  });

  // Sort by start position
  ranges.sort((a, b) => a.start - b.start);

  // Resolve overlaps: later ranges take precedence
  const resolved: HighlightRange[] = [];
  for (const range of ranges) {
    // Remove any ranges that overlap with this one
    while (
      resolved.length > 0 &&
      resolved[resolved.length - 1].end > range.start
    ) {
      const last = resolved[resolved.length - 1];
      if (last.start < range.start) {
        // Truncate the previous range
        last.end = range.start;
        break;
      } else {
        // Remove the previous range entirely
        resolved.pop();
      }
    }
    resolved.push(range);
  }

  return resolved;
}

/**
 * Split text into segments based on highlight ranges
 *
 * Returns array of { text, tacticIndex? } for rendering
 */
export interface TextSegment {
  text: string;
  tacticIndex?: number;
}

export function splitTextByHighlights(
  text: string,
  ranges: HighlightRange[]
): TextSegment[] {
  if (ranges.length === 0) {
    return [{ text }];
  }

  const segments: TextSegment[] = [];
  let lastEnd = 0;

  for (const range of ranges) {
    // Add non-highlighted segment before this range
    if (range.start > lastEnd) {
      segments.push({ text: text.slice(lastEnd, range.start) });
    }

    // Add highlighted segment
    segments.push({
      text: text.slice(range.start, range.end),
      tacticIndex: range.tacticIndex,
    });

    lastEnd = range.end;
  }

  // Add remaining non-highlighted text
  if (lastEnd < text.length) {
    segments.push({ text: text.slice(lastEnd) });
  }

  return segments;
}
