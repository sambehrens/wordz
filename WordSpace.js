/**
 * The space of all available words.
 * I don't why I called it this. I guess it sounded fancy.
 */
class WordSpace {
  static letters = "abcdefghijklmnopqrstuvwxyz";

  constructor(...wordInputs) {
    this.wordIndices = {};
    wordInputs.forEach(
      (wordInput) => (this.wordIndices[wordInput.words[0].length] = wordInput)
    );
  }

  /**
   * @param {number} length The length of the word
   * @param {string} [containing] If none provided, will return random word
   * @param {[string]} [disallowed] Words that shouldn't be chosen
   * @returns {string|null}
   */
  word(length, containing, startIndex = 1, disallowed = []) {
    const words = this.wordIndices[length].words;
    const letterIndices = this.wordIndices[length].indices;
    // If there is no containing then we can find an allowed random word
    if (!containing) {
      let word = "";
      do {
        word = words[random(words.length)];
      } while (disallowed.includes(word));
      return word;
    }

    let firstChar = containing.charAt(0);
    let beginningIndex = letterIndices[firstChar];
    let endOfMatchesIndex =
      firstChar === "z"
        ? words.length
        : letterIndices[
            WordSpace.letters[WordSpace.letters.indexOf(firstChar) + 1]
          ];

    let possibleWords = [];
    let reachedPossibleWords = false;
    for (let i = beginningIndex; i < endOfMatchesIndex; i++) {
      let word = words[i];
      if (
        word.slice(startIndex, startIndex + containing.length) === containing
      ) {
        possibleWords.push(word);
        reachedPossibleWords = true;
      } else if (reachedPossibleWords) {
        break;
      }
    }

    // Remove disallowed words from possible words so we don't get duplicates
    for (const word of disallowed) {
      let index = possibleWords.indexOf(word);
      if (index > -1) {
        possibleWords.splice(index, 1);
      }
    }

    return possibleWords.length
      ? possibleWords[random(possibleWords.length)]
      : null;
  }
}

