import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard Shadcn-style utility for merging Tailwind classes safely.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
