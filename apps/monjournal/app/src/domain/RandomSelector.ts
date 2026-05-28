/**
 * Pure function for uniform random selection from an array.
 *
 * Uses a uniform distribution algorithm: Math.floor(randomFn() * length)
 * This ensures each item has an equal probability of selection: 1/length
 *
 * @template T - The type of items in the array
 * @param items - The array to select from
 * @param randomFn - Optional custom random number generator (defaults to Math.random).
 *                   Must return a number in [0, 1). Allows deterministic testing with seeds.
 * @returns A randomly selected item from the array, or null if the array is empty
 *
 * @example
 * // Basic usage with uniform distribution
 * const entries = [entry1, entry2, entry3];
 * const selected = selectRandom(entries);  // Equal probability for each
 *
 * @example
 * // Testing with seeded random function
 * const seededRandom = () => {
 *   // Implement seeded RNG for deterministic results
 * };
 * const selected = selectRandom(entries, seededRandom);
 *
 * @example
 * // Handling empty array
 * const selected = selectRandom([]);  // Returns null
 * if (selected === null) {
 *   console.log('No entries available');
 * }
 */
export function selectRandom<T>(
  items: T[],
  randomFn: (() => number) | undefined = undefined,
): T | null {
  // Handle empty array - return null gracefully
  if (!items.length) {
    return null;
  }

  // Use provided randomFn or default to Math.random
  const rng = randomFn ?? Math.random;

  // Uniform distribution: floor(random * length) gives [0, length-1]
  const index = Math.floor(rng() * items.length);

  return items[index];
}
