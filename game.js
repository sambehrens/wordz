class App {
  constructor() {
    this.newGame();
    this.settingsOpen = false;
    this.settings = [{ label: "Dark mode", type: "toggle" }];
  }

  newGame() {
    this.game = new Game();
  }

  getControl(settingType) {
    const input = document.createElement("input");
    input.type = "checkbox";
  }

  getSettingsRow(setting) {
    const container = document.createElement("div");
    container.classList.add("settings-row");
    const label = document.createElement("div");
    label.classList.add("settings-row-label");
    label.appendChild(document.createTextNode(setting.label));
    const control = this.getControl(setting.type);
    container.appendChild(label);
    container.appendChild(control);
    return container;
  }

  drawSettings() {
    const root = document.getElementById("settings-root");
    const panel = document.createElement("div");
    panel.classList.add("settings-panel");
    this.settings.forEach((setting) => {
      panel.appendChild(this.getSettingsRow(setting));
    });
    root.appendChild(panel);
  }

  closeSettings() {
    const root = document.getElementById("settings-root");
    while (root.firstChild) {
      root.removeChild(root.firstChild);
    }
  }
}

/**
 * The space of all available words.
 * I don't why I called it this. I guess it sounded fancy.
 */
class WordSpace {
  static letters = "abcdefghijklmnopqrstuvwxyz";

  constructor(wordInput) {
    this.words = wordInput.words;
    this.letterIndices = wordInput.indices;
  }

  /**
   * @param {string} [containing] If none provided, will return random word
   * @param {[string]} [disallowed] Words that shouldn't be chosen
   * @returns {string|null}
   */
  word(containing, disallowed = []) {
    // If there is no containing then we can find an allowed random word
    if (!containing) {
      let word = "";
      do {
        word = this.words[random(this.words.length)];
      } while (disallowed.includes(word));
      return word;
    }

    let firstChar = containing.charAt(0);
    let index = this.letterIndices[firstChar];
    let endIndex =
      firstChar === "z"
        ? this.words.length
        : this.letterIndices[
            WordSpace.letters[WordSpace.letters.indexOf(firstChar) + 1]
          ];

    let possibleWords = [];
    let reachedPossibleWords = false;
    for (let i = index; i < endIndex; i++) {
      let word = this.words[i];
      if (word.slice(1, -1) === containing) {
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

class Game {
  constructor() {
    this.board = new Board(new WordSpace(word_input));
  }
}

class Board {
  constructor(wordSpace) {
    this.wordSpace = wordSpace;

    let gameWords = this.generateGameWords();

    const letterMatrix = [];
    for (let i = 0; i < 5; i++) {
      letterMatrix.push([]);
      for (let j = 0; j < 5; j++) {
        if (i % 4 === 0 && j % 4 === 0) {
          letterMatrix[i].push("");
        } else if (i === 0) {
          letterMatrix[i].push(gameWords[0][j - 1].charAt(0));
        } else if (i === 4) {
          letterMatrix[i].push(gameWords[0][j - 1].charAt(4));
        } else {
          letterMatrix[i].push(gameWords[1][i - 1].charAt(j));
        }
      }
    }

    this.letterMatrix = letterMatrix;

    this.currentLetterMatrix = letterMatrix.map((letterRow, i) =>
      letterRow.map((letter, j) => {
        if (
          i % (letterMatrix.length - 1) !== 0 &&
          j % (letterRow.length - 1) !== 0
        ) {
          return "";
        } else {
          return letter;
        }
      })
    );

    this.focusedIndex = -1;
    this.complete = false;
    const unEnteredLetters = [];
    loop(this.letterMatrix, (letter) => {
      unEnteredLetters.push(letter);
    });
    this.shelfLetters = shuffleArr(unEnteredLetters);
    this.hintsGiven = [];

    this.drawBoard();
    this.drawShelf();
    console.log(gameWords);
  }

  generateGameWords() {
    console.time("generating matrix");
    let gameWords;
    let filled = false;
    while (!filled) {
      gameWords = [[], []];
      gameWords[0].push(this.wordSpace.word());
      gameWords[0].push(this.wordSpace.word(null, gameWords[0]));
      gameWords[0].push(this.wordSpace.word(null, gameWords[0]));
      let slice1 = gameWords[0][0][1] + gameWords[0][1][1] + gameWords[0][2][1];
      let slice2 = gameWords[0][0][2] + gameWords[0][1][2] + gameWords[0][2][2];
      let slice3 = gameWords[0][0][3] + gameWords[0][1][3] + gameWords[0][2][3];
      gameWords[1].push(this.wordSpace.word(slice1, gameWords[0]));
      gameWords[1].push(
        this.wordSpace.word(slice2, gameWords[0].concat(gameWords[1]))
      );
      gameWords[1].push(
        this.wordSpace.word(slice3, gameWords[0].concat(gameWords[1]))
      );
      filled = gameWords[1].every(Boolean);
      console.log(filled ? "success" : "failed");
    }
    console.timeEnd("generating matrix");
    return gameWords;
  }

  getSquare(i, j, letter, draggable, shelf, shelfIndex) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.id = letter;
    if (this.hintsGiven.includes(`${i},${j}`)) {
      square.classList.add("hint-given");
    }
    if (letter) {
      square.classList.add("with-contents");
    }
    if (draggable) {
      square.classList.add("draggable");
      square.onclick = () => this.changeBoard(i, j, letter, shelf, shelfIndex);
      if (!letter) {
        square.classList.add("empty");
      }
      if (this.complete) {
        // Give the complete squares a bit of an animation
        setTimeout(() => square.classList.add("complete"), (i + j - 2) * 100);
      }
    }
    if (shelf) {
      square.classList.add("shelved");
      if (shelfIndex === this.focusedIndex) {
        square.classList.add("focused");
      }
    }
    const content = document.createElement("div");
    const letterSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    const letterText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    letterSvg.setAttribute("viewBox", "0 0 18 18");
    letterText.setAttribute("x", "50%");
    letterText.setAttribute("y", "60%");
    letterText.appendChild(document.createTextNode(letter));
    content.classList.add("content");
    letterSvg.appendChild(letterText);
    square.appendChild(letterSvg);
    return square;
  }

  drawBoard() {
    document.getElementById("words").innerHTML = "";
    for (let i = 0; i < this.letterMatrix.length; i++) {
      for (let j = 0; j < this.letterMatrix[0].length; j++) {
        const currentLetter = this.currentLetterMatrix[i][j];
        const hinted = this.hintsGiven.includes(`${i},${j}`);
        document
          .getElementById("words")
          .appendChild(
            this.getSquare(
              i,
              j,
              currentLetter,
              i % (this.letterMatrix.length - 1) !== 0 &&
                j % (this.letterMatrix[0].length - 1) !== 0 &&
                !hinted,
              false
            )
          );
      }
    }
  }

  drawShelf() {
    const shelf = document.getElementById("letter-bar");
    shelf.innerHTML = "";
    this.shelfLetters.forEach((letter, i) => {
      shelf.appendChild(this.getSquare(0, 0, letter, true, true, i));
    });
  }

  changeBoard(i, j, letter = "", shelf, shelfIndex) {
    if (this.complete || this.hintsGiven.includes("i,j")) return;
    if (shelf) {
      this.focusedIndex = shelfIndex;
      this.drawShelf();
    } else if (letter) {
      this.currentLetterMatrix[i][j] = "";
      this.shelfLetters.push(letter);
      this.focusedIndex = this.shelfLetters.length - 1;

      this.checkComplete();
      this.drawBoard();
      this.drawShelf();
    } else if (this.focusedIndex !== -1) {
      this.currentLetterMatrix[i][j] = this.shelfLetters[this.focusedIndex];
      this.shelfLetters.splice(this.focusedIndex, 1);
      this.focusedIndex = -1;

      this.checkComplete();
      this.drawBoard();
      this.drawShelf();
    }
  }

  checkComplete() {
    let complete = true;
    loop(this.letterMatrix, (letter, i, j) => {
      if (letter !== this.currentLetterMatrix[i][j]) {
        complete = false;
      }
    });
    this.complete = complete;
  }

  hint() {
    if (this.complete) return;
    let hintGiven = false;
    let shuffled = shuffleArr(this.shelfLetters);
    shuffled.some((letter) => {
      // if the spot where the letter would go is taken then go to the next letter
      // if the spot is not taken then add it to the spot and mark hint given and return
      loop(this.letterMatrix, (currentLetter, i, j) => {
        if (!this.currentLetterMatrix[i][j]) {
          if (letter === currentLetter) {
            this.currentLetterMatrix[i][j] = currentLetter;
            const indexToRemove = this.shelfLetters.findIndex(
              (shelfLetter) => shelfLetter === currentLetter
            );
            this.shelfLetters.splice(indexToRemove, 1);
            this.hintsGiven.push(`${i},${j}`);
            hintGiven = true;
            return "stop";
          }
        }
      });
      return hintGiven;
    });
    if (this.shelfLetters.length && !hintGiven) {
      // add the first letter in shelf letters to board and
      // remove the letter that is in it spot and put it in the shelf
      loop(this.letterMatrix, (currentLetter, i, j) => {
        if (shuffled[0] === currentLetter) {
          const originalLetter = this.currentLetterMatrix[i][j];
          this.currentLetterMatrix[i][j] = currentLetter;
          const indexToRemove = this.shelfLetters.findIndex(
            (shelfLetter) => shelfLetter === currentLetter
          );
          this.shelfLetters.splice(indexToRemove, 1);
          this.shelfLetters.push(originalLetter);
          this.hintsGiven.push(`${i},${j}`);
          return "stop";
        }
      });
    }
    this.checkComplete();
    this.drawShelf();
    this.drawBoard();
  }
}

/**
 * Makes it easy to loop through the board
 */
function loop(matrix, fun) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      if (i % (matrix.length - 1) !== 0 && j % (matrix[0].length - 1) !== 0) {
        const stop = fun(matrix[i][j], i, j) === "stop";
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
function shuffleArr(array) {
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
function random(upperBound) {
  return Math.floor(Math.random() * upperBound);
}

const app = new App();

function hint() {
  app.game.board.hint();
}

function restart() {
  app.newGame();
}
