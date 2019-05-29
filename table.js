const { Game } = require("./game");

class Table {
  constructor(io) {
    this.io = io;
    this.id = Math.random().toString();
    this.players = [];
    this.game = null;
    this.isRunning = false;
  }

  startNewGame() {
    this.game = new Game(this.io);
    this.game.players = this.players;
    this.game.start();
  }

  playerJoin(player) {
    player.gameId = this.id;
    this.players = this.players.concat(player);
  }
}

module.exports = { Table };
