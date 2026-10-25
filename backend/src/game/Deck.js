import crypto from "node:crypto";

const SUITS = ["s", "h", "d", "c"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"];

export class Deck {
  constructor() {
    this.cards = [];
    this.reset();
  }

  reset() {
    this.cards = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        this.cards.push(`${rank}${suit}`);
      }
    }
    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = crypto.randomInt(0, i + 1);
      const temp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = temp;
    }
  }

  draw(count = 1) {
    if (this.cards.length < count) {
      throw new Error("Not enough cards in deck");
    }
    if (count === 1) {
      return this.cards.pop();
    }
    const drawn = [];
    for (let i = 0; i < count; i++) {
      drawn.push(this.cards.pop());
    }
    return drawn;
  }

  get remaining() {
    return this.cards.length;
  }
}