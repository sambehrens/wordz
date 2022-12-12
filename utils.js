/**
 * Makes it easy to loop through the board
 */
export function loop(matrix, fn) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (i % (matrix.length - 1) !== 0 && j % (matrix[0].length - 1) !== 0) {
        const stop = fn(matrix[i][j], i, j) === "stop";
        if (stop) {
          return;
        }
      }
    }
  }
}

/**
 * From Lodash:
 * Creates an array of shuffled values, using a version of the
 * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
 *
 * @param {Array} array The array to shuffle.
 * @returns {Array} Returns the new shuffled array.
 * @example
 *
 * shuffle([1, 2, 3, 4])
 * // => [4, 1, 3, 2]
 */
export function shuffleArr(array) {
  const length = array == null ? 0 : array.length;
  if (!length) {
    return [];
  }
  let index = -1;
  const lastIndex = length - 1;
  const result = [...array];
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
    const value = result[rand];
    result[rand] = result[index];
    result[index] = value;
  }
  return result;
}

/**
 * @param {number} upperBound Note this is exclusive
 * @returns {number}
 */
export function random(upperBound) {
  return Math.floor(Math.random() * upperBound);
}
