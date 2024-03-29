import { shuffleArr, loop } from './utils.js';

export class Board {
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

    let currentLetterMatrix = letterMatrix.map((letterRow, i) =>
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
    this.draggingTile = null;
    this.complete = false;
    const unEnteredLetters = [];
    loop(this.letterMatrix, (letter) => {
      unEnteredLetters.push(letter);
    });
    let shelfLetters = shuffleArr(unEnteredLetters);

    this.boardTiles = currentLetterMatrix.map((letterRow, i) =>
      letterRow.map((letter, j) =>
        this.getSquare(
          i,
          j,
          letter,
          i % (letterMatrix.length - 1) !== 0 &&
            j % (letterRow.length - 1) !== 0
        )
      )
    );
    this.shelfTiles = shelfLetters.map((letter, i) =>
      this.getSquare(0, 0, letter, true, true, i)
    );
    this.drawBoard();
    this.drawShelf();
    console.log(gameWords);

    this.mousemove = this.onMouseMove.bind(this);
    this.mouseup = this.onMouseUp.bind(this);

    document.addEventListener("mousemove", this.mousemove);
    document.addEventListener("mouseup", this.mouseup);
    document.addEventListener("touchmove", this.mousemove);
    document.addEventListener("touchend", this.mouseup);

    this.menuNode = document.getElementById("menu");
  }

  generateGameWords() {
    console.time("generating matrix");
    let gameWords;
    let filled = false;
    while (!filled) {
      gameWords = [[], []];
      gameWords[0].push(this.wordSpace.word(5));
      gameWords[0].push(this.wordSpace.word(5, null, undefined, gameWords[0]));
      gameWords[0].push(this.wordSpace.word(5, null, undefined, gameWords[0]));
      let slice1 = gameWords[0][0][1] + gameWords[0][1][1] + gameWords[0][2][1];
      let slice2 = gameWords[0][0][2] + gameWords[0][1][2] + gameWords[0][2][2];
      let slice3 = gameWords[0][0][3] + gameWords[0][1][3] + gameWords[0][2][3];
      gameWords[1].push(
        this.wordSpace.word(5, slice1, undefined, gameWords[0])
      );
      gameWords[1].push(
        this.wordSpace.word(
          5,
          slice2,
          undefined,
          gameWords[0].concat(gameWords[1])
        )
      );
      gameWords[1].push(
        this.wordSpace.word(
          5,
          slice3,
          undefined,
          gameWords[0].concat(gameWords[1])
        )
      );
      filled = gameWords[1].every(Boolean);
      console.log(filled ? "success" : "failed");
    }
    console.timeEnd("generating matrix");
    return gameWords;
  }

  getSquare(i, j, letter, draggable, shelf, shelfIndex) {
    let square = document.createElement("letter-tile");
    square.setAttribute("letter", letter);

    square.onmousedown = (event) => this.onMouseDown(event);
    square.ontouchstart = (event) => this.onMouseDown(event);

    if (letter && !draggable) {
      square.setAttribute("state", "permanent");
    } else if (draggable && !letter) {
      square.setAttribute("state", "empty");
    } else if (draggable && this.complete) {
      square.setAttribute("state", "complete");
    } else if (shelfIndex === this.focusedIndex) {
      square.setAttribute("state", "focused");
    } else if (shelf) {
      square.setAttribute("state", "shelved");
    } else if (draggable) {
      square.setAttribute("state", "guessed");
    } else {
      square.setAttribute("state", "filler");
    }
    square.setAttribute("data-i-coord", i);
    square.setAttribute("data-j-coord", j);
    return square;
  }

  drawBoard() {
    let wordsContainer = document.getElementById("words");
    wordsContainer.append(
      ...this.boardTiles.reduce((acc, row) => [...acc, ...row], [])
    );
  }

  updateTile(state, i, j, letter = "") {
    let tile = this.boardTiles[i][j];
    if (tile.getAttribute("state") !== "hinted") {
      tile.setAttribute("letter", letter);
      tile.setAttribute("state", state);
    }
    if (this.isComplete()) {
      loop(this.boardTiles, (tile) => {
        tile.getAttribute("state") !== "hinted" &&
          tile.setAttribute("state", "complete");
      });
    }
  }

  drawShelf() {
    let shelf = document.getElementById("letter-bar");
    shelf.append(...this.shelfTiles);
  }

  updateShelf(type, index, letter) {
    let shelf = document.getElementById("letter-bar");
    switch (type) {
      case "remove":
        let tile = this.shelfTiles.splice(index, 1)[0];
        shelf.removeChild(tile);
        break;
      case "add":
        this.shelfTiles.push(
          this.getSquare(0, 0, letter, true, true, this.shelfTiles.length)
        );
        shelf.appendChild(this.shelfTiles[this.shelfTiles.length - 1]);
        break;
      case "focus":
        this.shelfTiles.forEach(
          (tile) =>
            tile.getAttribute("state") === "focused" &&
            tile.setAttribute("state", "shelved")
        );
        this.shelfTiles[index].setAttribute("state", "focused");
        break;
      case "unfocus":
        this.shelfTiles[index].setAttribute("state", "shelved");
        break;
    }
  }

  onMouseDown(event) {
    switch (event.target.getAttribute("state")) {
      case "focused":
      case "shelved":
        this.draggingTile = event.target;
        this.focusedIndex = this.shelfTiles.indexOf(event.target);
        this.updateShelf("focus", this.shelfTiles.indexOf(event.target));
        break;
      case "guessed":
        this.draggingTile = event.target;
        this.focusedIndex = -1;
        break;
    }
    event.preventDefault();
  }

  onMouseMove(event) {
    let x = event.pageX;
    let y = event.pageY;
    if (event.type === "touchmove") {
      x = event.touches[0].pageX;
      y = event.touches[0].pageY;
    }
    if (this.draggingTile === null) return;
    this.draggingTile.style.transform = `translate(${
      x -
      this.draggingTile.offsetLeft -
      this.draggingTile.offsetWidth / 2
    }px,${
      y -
      this.draggingTile.offsetTop -
      this.draggingTile.offsetHeight / 2
    }px)`;
    this.draggingTile.style.zIndex = 1;
    this.draggingTile.style.pointerEvents = "none";
    event.preventDefault();
  }

  onMouseUp(event) {
    if (!this.menuNode.contains(event.target)) event.preventDefault();
    let target = event.target;
    let changedTouches = event.changedTouches;
    if (changedTouches && changedTouches[0]) {
      target = document.elementFromPoint(
        changedTouches[0].clientX,
        changedTouches[0].clientY
      );
    }
    if (this.draggingTile === null) {
      if (this.focusedIndex !== -1) {
        switch (target.getAttribute("state")) {
          case "empty":
            let i = target.getAttribute("data-i-coord");
            let j = target.getAttribute("data-j-coord");
            let letter =
              this.shelfTiles[this.focusedIndex].getAttribute("letter");
            this.updateTile("guessed", i, j, letter);
            this.updateShelf("remove", this.focusedIndex);
            this.focusedIndex = -1;
            break;
        }
      }
      return;
    }
    let draggingTileState = this.draggingTile.getAttribute("state");
    let letter = this.draggingTile.getAttribute("letter");
    let draggingTileI = this.draggingTile.getAttribute("data-i-coord");
    let draggingTileJ = this.draggingTile.getAttribute("data-j-coord");
    let targetState = target.getAttribute("state");
    let targetLetter = target.getAttribute("letter");
    switch (targetState) {
      case "guessed":
      case "empty":
        let i = target.getAttribute("data-i-coord");
        let j = target.getAttribute("data-j-coord");
        this.updateTile("guessed", i, j, letter);
        if (draggingTileState === "guessed") {
          this.updateTile("empty", draggingTileI, draggingTileJ);
          this.draggingTile.style.transform = "none";
        }
        if (this.focusedIndex !== -1) {
          this.updateShelf("remove", this.focusedIndex);
        }
        if (targetState === "guessed") {
          this.updateShelf("add", undefined, targetLetter);
          this.updateShelf("focus", this.shelfTiles.length - 1);
          this.focusedIndex = this.shelfTiles.length - 1;
        }
        if (targetState === "empty") {
          this.focusedIndex = -1;
        }
        break;
      default:
        this.draggingTile.style.transform = "none";
        if (draggingTileState === "guessed") {
          this.updateTile("empty", draggingTileI, draggingTileJ);
        }
        if (draggingTileState !== "focused") {
          this.updateShelf("add", undefined, letter);
          this.updateShelf("focus", this.shelfTiles.length - 1);
          this.focusedIndex = this.shelfTiles.length - 1;
        }
        break;
    }
    this.draggingTile.style.zIndex = 0;
    this.draggingTile.style.pointerEvents = "auto";
    this.draggingTile = null;
  }

  isComplete() {
    let complete = true;
    loop(this.letterMatrix, (letter, i, j) => {
      if (letter !== this.boardTiles[i][j].getAttribute("letter")) {
        complete = false;
        return "stop";
      }
    });
    return complete;
  }

  hint() {
    if (this.isComplete()) return;
    let hintedLetter;
    let shelfIndex;
    let shuffled = shuffleArr(this.shelfTiles).map(tile => tile.getAttribute("letter"));
    let hintCoordinates;
    shuffled.some((letter) => {
      // if the spot where the letter would go is taken then go to the next letter
      // if the spot is not taken then add it to the spot and mark hint given and return
      loop(this.letterMatrix, (currentLetter, i, j) => {
        if (this.boardTiles[i][j].getAttribute("state") === "empty") {
          if (letter === currentLetter) {
            const indexToRemove = this.shelfTiles.findIndex(
              (tile) => tile.getAttribute("letter") === currentLetter
            );
            hintCoordinates = [i, j];
            shelfIndex = indexToRemove;
            hintedLetter = currentLetter;
            return "stop";
          }
        }
      });
      return hintedLetter;
    });
    if (this.shelfTiles.length && !hintedLetter) {
      // add the first letter in shelf letters to board and
      // remove the letter that is in it spot and put it in the shelf
      loop(this.letterMatrix, (currentLetter, i, j) => {
        if (shuffled[0] === currentLetter) {
          const indexToRemove = this.shelfTiles.findIndex(
            (tile) => tile.getAttribute("letter") === currentLetter
          );
          hintCoordinates = [i, j];
          shelfIndex = indexToRemove;
          hintedLetter = currentLetter;
          this.updateShelf("add", undefined, this.boardTiles[i][j].getAttribute("letter"));
          return "stop";
        }
      });
    }
    hintCoordinates && this.updateShelf("remove", shelfIndex);
    hintedLetter && this.updateTile("hinted", ...hintCoordinates, hintedLetter);
  }

  cleanUp() {
    document.getElementById("words").innerHTML = "";
    document.getElementById("letter-bar").innerHTML = "";

    document.removeEventListener("mousemove", this.mousemove);
    document.removeEventListener("mouseup", this.mouseup);
    document.removeEventListener("touchmove", this.mousemove);
    document.removeEventListener("touchend", this.mouseup);
  }
}
