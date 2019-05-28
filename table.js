class Table {
  constructor() {
    this.id = Math.random().toString();
    this.players = [];
    this.game = null;
    this.isRunning = false;
  }

  startNewGame() {
    this.game = new Game();
    game.players = this.players;
  }
}
