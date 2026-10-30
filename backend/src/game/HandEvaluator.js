const RANK_VALUES = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "T": 10,
  "J": 11,
  "Q": 12,
  "K": 13,
  "A": 14
};

const CATEGORY_NAMES = {
  8: "Straight Flush",
  7: "Four of a Kind",
  6: "Full House",
  5: "Flush",
  4: "Straight",
  3: "Three of a Kind",
  2: "Two Pair",
  1: "One Pair",
  0: "High Card"
};

export class HandEvaluator {
  static parseCard(cardStr) {
    return {
      rank: RANK_VALUES[cardStr[0]],
      suit: cardStr[1],
      raw: cardStr
    };
  }

  static getCombinations(arr, k) {
    if (k === 0) return [[]];
    if (arr.length < k) return [];
    const [first, ...rest] = arr;
    const withFirst = this.getCombinations(rest, k - 1).map(c => [first, ...c]);
    const withoutFirst = this.getCombinations(rest, k);
    return [...withFirst, ...withoutFirst];
  }

  static evaluateFiveCards(cards) {
    const parsed = cards.map(c => (typeof c === "string" ? this.parseCard(c) : c));
    const ranks = parsed.map(c => c.rank).sort((a, b) => b - a);
    const suits = parsed.map(c => c.suit);

    const isFlush = suits.every(s => s === suits[0]);

    const uniqueRanks = Array.from(new Set(ranks));
    let isStraight = false;
    let straightHigh = 0;

    if (uniqueRanks.length === 5) {
      if (uniqueRanks[0] - uniqueRanks[4] === 4) {
        isStraight = true;
        straightHigh = uniqueRanks[0];
      } else if (
        uniqueRanks[0] === 14 &&
        uniqueRanks[1] === 5 &&
        uniqueRanks[2] === 4 &&
        uniqueRanks[3] === 3 &&
        uniqueRanks[4] === 2
      ) {
        isStraight = true;
        straightHigh = 5;
      }
    }

    const counts = new Map();
    for (const r of ranks) {
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }

    const groups = Array.from(counts.entries())
      .map(([rank, count]) => ({ rank, count }))
      .sort((a, b) => b.count - a.count || b.rank - a.rank);

    let category = 0;
    let tiebreakers = [];

    if (isFlush && isStraight) {
      category = 8;
      tiebreakers = [straightHigh];
    } else if (groups[0].count === 4) {
      category = 7;
      tiebreakers = [groups[0].rank, groups[1].rank];
    } else if (groups[0].count === 3 && groups[1].count === 2) {
      category = 6;
      tiebreakers = [groups[0].rank, groups[1].rank];
    } else if (isFlush) {
      category = 5;
      tiebreakers = ranks;
    } else if (isStraight) {
      category = 4;
      tiebreakers = [straightHigh];
    } else if (groups[0].count === 3) {
      category = 3;
      tiebreakers = [groups[0].rank, groups[1].rank, groups[2].rank];
    } else if (groups[0].count === 2 && groups[1].count === 2) {
      category = 2;
      tiebreakers = [groups[0].rank, groups[1].rank, groups[2].rank];
    } else if (groups[0].count === 2) {
      category = 1;
      tiebreakers = [groups[0].rank, groups[1].rank, groups[2].rank, groups[3].rank];
    } else {
      category = 0;
      tiebreakers = ranks;
    }

    return {
      category,
      categoryName: CATEGORY_NAMES[category],
      tiebreakers,
      cards: parsed.map(c => c.raw)
    };
  }

  static compareEvaluations(evalA, evalB) {
    if (evalA.category !== evalB.category) {
      return evalA.category - evalB.category;
    }
    const len = Math.max(evalA.tiebreakers.length, evalB.tiebreakers.length);
    for (let i = 0; i < len; i++) {
      const diff = (evalA.tiebreakers[i] ?? 0) - (evalB.tiebreakers[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  static evaluateSevenCards(sevenCards) {
    const combos = this.getCombinations(sevenCards, 5);
    let best = null;
    for (const combo of combos) {
      const current = this.evaluateFiveCards(combo);
      if (!best || this.compareEvaluations(current, best) > 0) {
        best = current;
      }
    }
    return best;
  }

  static findWinners(playersWithCards, boardCards) {
    let bestEval = null;
    let winners = [];
    const evaluations = new Map();

    for (const player of playersWithCards) {
      const allCards = [...player.holeCards, ...boardCards];
      const evaluation = this.evaluateSevenCards(allCards);
      evaluations.set(player.playerId, evaluation);

      if (!bestEval) {
        bestEval = evaluation;
        winners = [player.playerId];
      } else {
        const cmp = this.compareEvaluations(evaluation, bestEval);
        if (cmp > 0) {
          bestEval = evaluation;
          winners = [player.playerId];
        } else if (cmp === 0) {
          winners.push(player.playerId);
        }
      }
    }

    return {
      winners,
      bestHand: bestEval,
      evaluations
    };
  }
}