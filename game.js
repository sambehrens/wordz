import { Board } from "./Board.js";
import { WordSpace } from "./WordSpace.js";

export class Game {
  constructor() {
    this.board = new Board(new WordSpace(word_input_5));
  }

  cleanUp() {
    this.board.cleanUp();
  }
}
