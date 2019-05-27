class Player {
  constructor(id, name, chips = 1000) {
    this.id = id;
    this.name = name;
    this.chips = chips;
    this.cards = [];
    this.cardsRank = null;
  }

  setHandRank(rank) {
    this.cardsRank = rank;
  }
  receiveOneCard(card) {
    this.cards.push(card);
  }
}

module.exports = { Player };
