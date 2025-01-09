import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function that combines Tailwind CSS classes using clsx and tailwind-merge.
 * Merges multiple class values into a single string, handling Tailwind conflicts.
 *
 * @param inputs - Array of class values to be merged
 * @returns Merged class string with resolved Tailwind conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
