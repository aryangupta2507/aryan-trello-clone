/**
 * Calculates a new position value for float-based sorting on drag-and-drop.
 * 
 * @param prevPosition The position of the item before the drop target (null if dropped at the beginning)
 * @param nextPosition The position of the item after the drop target (null if dropped at the end)
 * @returns The new floating-point position value
 */
export function getNewPosition(
  prevPosition: number | null | undefined,
  nextPosition: number | null | undefined
): number {
  const DEFAULT_STEP = 1000;

  // Case 1: Empty list or no siblings
  if (prevPosition === null || prevPosition === undefined) {
    if (nextPosition === null || nextPosition === undefined) {
      return DEFAULT_STEP;
    }
    // Case 2: Dropped at the beginning of the list
    return nextPosition / 2;
  }

  // Case 3: Dropped at the end of the list
  if (nextPosition === null || nextPosition === undefined) {
    return prevPosition + DEFAULT_STEP;
  }

  // Case 4: Dropped in between two items
  return (prevPosition + nextPosition) / 2;
}
