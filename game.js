const { generateShuffledCards } = require("./card");
const { Player } = require("./player");

class Game {
  constructor(io) {
    this.io = io;
    this.id = Math.random().toString();
    this.players = [];
    this.cards = generateShuffledCards();
    this.tableCards = [];
    this.pot = 0;
    this.burnCards = [];
    this.isRunning = false;
  }

  burnCard() {
    this.burnCards.push(this.popCards());
  }

  popCards(quantity = null) {
    return quantity ? this.cards.splice(-quantity) : this.cards.pop();
  }

  resetGame() {
    this.players.forEach(player => {
      this.cards = [...this.cards, ...player.cards];
      player.cards = [];
    });
    this.cards = [...this.cards, ...this.burnCards, ...this.tableCards];
    this.tableCards = [];
    this.burnCards = [];
  }

  sendRounds() {
    console.log(`Sending Rounds`);
    this.players.forEach(({ cards, chips, id }) => {
      this.io.emit(id, { cards, chips, tableCards: [] });
      console.log(`First Round`);
      setTimeout(() => {
        console.log(`Second Round`);
        this.io.emit(id, { cards, chips, tableCards: this.tableCards });
        setTimeout(() => {
          console.log(`Next Round`);
          this.resetGame();
          this.start();
        }, 3000);
      }, 3000);
    });
  }

  start() {
    console.log(`Game is running`);
    this.isRunning = true;
    this.cards = generateShuffledCards(this.cards);
    for (let i = 0; i < 2; i++) {
      this.players.forEach(player => {
        let card = this.popCards();
        card.place = "player";
        player.receiveOneCard(card);
      });
      let card = this.popCards();
      card.place = "table";
      this.tableCards.push(card);
      this.burnCard();
    }
    this.popCards(3).forEach(card => {
      card.place = "table";
      this.tableCards.push(card);
    });
    this.sendRounds();
  }
}

module.exports = { Game };
