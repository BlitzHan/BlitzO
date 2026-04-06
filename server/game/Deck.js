const { v4: uuidv4 } = require('uuid');

const COLORS = ['red', 'blue', 'green', 'yellow'];
const SPECIAL_TYPES = ['skip', 'reverse', 'draw2'];

class Deck {
  constructor() {
    this.cards = [];
    this.discardPile = [];
    this.build();
  }

  build() {
    this.cards = [];

    for (const color of COLORS) {
      this.cards.push({ id: uuidv4(), color, type: 'number', value: 0 });

      for (let value = 1; value <= 9; value++) {
        this.cards.push({ id: uuidv4(), color, type: 'number', value });
        this.cards.push({ id: uuidv4(), color, type: 'number', value });
      }

      for (const specialType of SPECIAL_TYPES) {
        for (let i = 0; i < 2; i++) {
          this.cards.push({ id: uuidv4(), color, type: 'special', value: specialType });
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      this.cards.push({ id: uuidv4(), color: 'wild', type: 'wild', value: 'wild' });
      this.cards.push({ id: uuidv4(), color: 'wild', type: 'wild', value: 'wild4' });
    }

    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(count = 1) {
    if (this.cards.length < count) {
      if (this.discardPile.length > 1) {
        const topCard = this.discardPile.pop();
        this.cards = [...this.discardPile];
        this.discardPile = [topCard];
        this.shuffle();
      }
    }

    const drawn = [];
    for (let i = 0; i < count; i++) {
      if (this.cards.length > 0) {
        drawn.push(this.cards.pop());
      }
    }
    return drawn;
  }

  discard(card) {
    this.discardPile.push(card);
  }

  getTopCard() {
    return this.discardPile[this.discardPile.length - 1];
  }
}

module.exports = Deck;
