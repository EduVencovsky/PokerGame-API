class Player {
  constructor(name, chips = 1000) {
    this.id = Math.random().toString();
    this.name = name;
    this.chips = chips;
    this.cards = [];
    this.cardsRank = null;
    this.gameId = null;
  }

  setHandRank(rank) {
    this.cardsRank = rank;
  }
  receiveOneCard(card) {
    this.cards.push(card);
  }
}

module.exports = { Player };
