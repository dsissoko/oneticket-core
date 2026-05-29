import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes intelligently.
 *
 * Combines `clsx` for conditional class concatenation with `tailwind-merge`
 * to resolve conflicting Tailwind utility classes. Later classes override
 * earlier ones (e.g., 'px-2 px-4' → 'px-4').
 *
 * @example
 * cn('px-2', 'px-4')  // → 'px-4'
 * cn('bg-red-500', 'dark:bg-blue-500')  // → 'bg-red-500 dark:bg-blue-500'
 * cn('px-2', { 'px-4': true, 'px-6': false })  // → 'px-4'
 * cn(['p-2', 'p-4'])  // → 'p-4'
 *
 * @param inputs - Class names, objects, or arrays to merge
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
