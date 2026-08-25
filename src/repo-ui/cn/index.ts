import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';

import { customTwMerge } from './utils/custom-tw-merge';

/**
 * Combines and merges multiple class values into a single string using custom Tailwind merge.
 *
 * @param {...ClassValue[]} inputs - An array of class values to be merged.
 * Class values can be strings, objects, arrays, or undefined.
 *
 * @returns {string} A merged string of class names with Tailwind-specific optimizations.
 *
 * @example
 * cn('px-2', 'py-1 px-3', 'bg-red-500', { 'text-white': true })
 * // Returns: "py-1 px-3 bg-red-500 text-white"
 */
export const cn = (...inputs: ClassValue[]): string => {
  return customTwMerge(clsx(inputs));
};
