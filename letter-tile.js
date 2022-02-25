class LetterTile extends HTMLElement {
  constructor() {
    super();

    let shadow = this.attachShadow({ mode: "open" });

    let link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "./letter-tile.css");
    shadow.appendChild(link);

    this.square = document.createElement("div");
    let svgSpec = "http://www.w3.org/2000/svg";
    let letterSvg = document.createElementNS(svgSpec, "svg");
    let letterText = document.createElementNS(svgSpec, "text");
    letterSvg.setAttribute("viewBox", "0 0 18 18");
    letterText.setAttribute("x", "50%");
    letterText.setAttribute("y", "60%");
    letterText.appendChild(
      document.createTextNode(this.getAttribute("letter"))
    );
    letterSvg.appendChild(letterText);
    this.square.appendChild(letterSvg);

    shadow.appendChild(this.square);
    this.updateStyles();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // States = filler, hinted, guessed, permanent, complete, shelved, focused, empty
    name === "state" && this.updateStyles();
    name === "letter" &&
      this.shadowRoot
        .querySelector("text")
        .replaceChildren(document.createTextNode(newValue));
  }

  static get observedAttributes() {
    return ["state", "letter"];
  }

  updateStyles() {
    this.square.className = `square ${this.getAttribute("state") ?? "filler"}`;
  }
}

function getSquare(i, j, letter, draggable, shelf, shelfIndex) {
  if (draggable) {
    square.onclick = () => this.changeBoard(i, j, letter, shelf, shelfIndex);
  }
  if (shelf) {
    if (shelfIndex === this.focusedIndex) {
      square.classList.add("focused");
    }
  }
}

customElements.define("letter-tile", LetterTile);
