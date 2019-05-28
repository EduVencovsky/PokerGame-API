const pokerHands = {
  RoyalFlush: "Royal Flush",
  StraightFlush: "Straight Flush",
  FourOfAKind: "Four of a Kind",
  FullHouse: "Full House",
  Flush: "Flush",
  Straight: "Straight",
  ThreeOfAKind: "Three of a Kind",
  TwoPair: "Two Pair",
  Pair: "Pair",
  HighCard: "High Card"
};

const cardsValue = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14
};

const suits = {
  c: "♣️",
  h: "♥️",
  s: "♠️",
  d: "♦️"
};

class Cards {
  constructor(value, suit) {
    this.value = cardsValue[value];
    this.suit = suit;
    this.display = value + suits[suit];
    this.place = null;
  }

  toString() {
    return this.display;
  }
}

const generateCards = () => {
  let cards = [];
  Object.keys(suits).forEach(suit => {
    Object.keys(cardsValue).forEach(x => cards.push(new Cards(x, suit)));
  });
  return cards;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const shuffleCards = cards => {
  for (let i = 0; i < cards.length; i++) {
    let randomInt = getRandomInt(0, cards.length - 1);
    let temp = cards[i];
    cards[i] = cards[randomInt];
    cards[randomInt] = temp;
  }
  return cards;
};

const generateShuffledCards = (cards = null) => {
  return shuffleCards(cards ? cards : generateCards());
};

const checkHand = (playerCards, tableCards = []) => {
  let cards = [...playerCards, ...tableCards];
  if (cards.length < 5) {
    return [];
  }
  let flushCards = checkFlush(cards);
  if (flushCards) {
    let topFlushCards = flushCards
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); //get first 5 biggest flush cards

    let royalFlush = checkRoyalFlush(topFlushCards);
    if (royalFlush) {
      console.log(pokerHands.RoyalFlush, topFlushCards);
      return [pokerHands.RoyalFlush, royalFlush];
    }
    let straightFlush = checkStraight(flushCards);
    if (straightFlush) {
      console.log(pokerHands.StraightFlush, flushCards);
      return [pokerHands.StraightFlush, straightFlush];
    }
    console.log(pokerHands.Flush, topFlushCards);
    return [pokerHands.Flush, topFlushCards];
  }

  let straightCards = checkStraight(cards);
  if (straightCards) {
    console.log(pokerHands.Straight, straightCards);
    return [pokerHands.Straight, straightCards];
  }

  let cardsCount = {};
  cards.forEach(card => {
    if (cardsCount[card.value]) {
      cardsCount[card.value].push(card);
    } else {
      cardsCount[card.value] = [card];
    }
  });
  const sortedPairs = Object.values(cardsCount).sort((a, b) => {
    if (b.length - a.length === 0) {
      return b[0].value - a[0].value;
    }
    return b.length - a.length;
  });
  if (sortedPairs[0].length === 4) {
    console.log(pokerHands.FourOfAKind, sortedPairs[0]);
    return [pokerHands.FourOfAKind, sortedPairs[0]];
  } else if (sortedPairs[0].length === 3) {
    if (sortedPairs[1].length === 2) {
      console.log(pokerHands.FullHouse, [...sortedPairs[0], ...sortedPairs[1]]);
      return [pokerHands.FullHouse, [...sortedPairs[0], ...sortedPairs[1]]];
    }
    console.log(pokerHands.ThreeOfAKind, sortedPairs[0]);
    return [pokerHands.ThreeOfAKind, sortedPairs[0]];
  } else if (sortedPairs[0].length === 2) {
    if (sortedPairs[1].length === 2) {
      console.log(pokerHands.TwoPair, [...sortedPairs[0], ...sortedPairs[1]]);
      return [pokerHands.TwoPair, [...sortedPairs[0], ...sortedPairs[1]]];
    }
    console.log(pokerHands.Pair, sortedPairs[0]);
    return [pokerHands.Pair, sortedPairs[0]];
  }
  console.log(pokerHands.HighCard, sortedPairs[0]);
  return [pokerHands.HighCard, sortedPairs[0]];
};

/*
A-c K-c 2-d 3-s 4-c 5-h 6-h
A-c K-c 2-d 3-s 4-c 5-h 7-h
*/
// Check A K 6 5 4 3 2 Flush case
const checkAceEqualsOne = cards => {
  cards.sort((a, b) => {
    let valueA = a.value === 14 ? 1 : a.value;
    let valueB = b.value === 14 ? 1 : b.value;
    return valueB - valueA;
  });
  let countCards = [];
  for (let i = 0; i < cards.length; i++) {
    if (countCards.length === 0 || i === 0) {
      countCards.push(cards[i]);
      continue;
    }
    let valueI = cards[i - 1].value === 14 ? 1 : cards[i - 1].value;
    let valueI1 = cards[i].value === 14 ? 1 : cards[i].value;
    if (valueI - valueI1 === 1) {
      countCards.push(cards[i]);
    } else if (valueI - valueI1 !== 0) {
      countCards = [cards[i]];
    }
  }
  return countCards.length >= 5 ? countCards.splice(0, 5) : false;
};

// K-c 5-s 2-s 3-d 6-d 4-d 5-h
const checkStraight = cards => {
  cards.sort((a, b) => b.value - a.value);
  // Check A K 6 5 4 3 2 Straight case
  if (
    cards[0].value === 14 &&
    (cards[1].value !== 13 || cards[2].value !== 12)
  ) {
    return checkAceEqualsOne(cards);
  }
  let countCards = [];
  for (let i = 0; i < cards.length; i++) {
    if (countCards.length === 0) {
      countCards.push(cards[i]);
    } else if (cards[i - 1].value - cards[i].value === 1) {
      countCards.push(cards[i]);
    } else if (cards[i - 1].value - cards[i].value !== 0) {
      countCards = [cards[i]];
    }
  }
  return countCards.length >= 5 ? countCards.splice(0, 5) : false;
};

const checkRoyalFlush = cards =>
  cards[0].value === 14 &&
  cards[1].value === 13 &&
  cards[2].value === 12 &&
  cards[3].value === 11 &&
  cards[4].value === 10
    ? cards.slice(0, 5)
    : false;

const checkFlush = cards => {
  let suitsCount = {
    c: [],
    h: [],
    s: [],
    d: []
  };

  cards.forEach(card => {
    suitsCount[card.suit].push(card);
  });
  let flushSuit = Object.keys(suitsCount).filter(
    suit => suitsCount[suit].length >= 5
  )[0];
  return flushSuit ? suitsCount[flushSuit] : false;
};

module.exports = { generateShuffledCards };
