import { Game } from "./Game.js";

class App {
  constructor() {
    this.newGame();
    this.settingsOpen = false;
    this.settings = [{ label: "Dark mode", type: "toggle" }];
  }

  newGame() {
    this.game && this.game.cleanUp();
    this.game = new Game();
  }

  getControl() {
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

const app = new App();

function hint() {
  app.game.board.hint();
}

function restart() {
  app.newGame();
}
