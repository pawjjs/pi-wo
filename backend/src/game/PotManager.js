export class PotManager {
  constructor() {
    this.contributions = new Map();
    this.foldedPlayers = new Set();
  }

  reset() {
    this.contributions.clear();
    this.foldedPlayers.clear();
  }

  addContribution(playerId, amount) {
    if (amount <= 0) return;
    const current = this.contributions.get(playerId) ?? 0;
    this.contributions.set(playerId, current + amount);
  }

  markFolded(playerId) {
    this.foldedPlayers.add(playerId);
  }

  get totalPot() {
    let sum = 0;
    for (const amount of this.contributions.values()) {
      sum += amount;
    }
    return sum;
  }

  getPlayerContribution(playerId) {
    return this.contributions.get(playerId) ?? 0;
  }

  calculatePots() {
    const entries = Array.from(this.contributions.entries())
      .filter(([, amount]) => amount > 0)
      .map(([playerId, amount]) => ({
        playerId,
        amount,
        folded: this.foldedPlayers.has(playerId)
      }));

    if (entries.length === 0) {
      return [];
    }

    const activeLevels = Array.from(
      new Set(entries.filter(e => !e.folded).map(e => e.amount))
    ).sort((a, b) => a - b);

    const maxContribution = Math.max(...entries.map(e => e.amount));
    if (activeLevels.length === 0 || activeLevels[activeLevels.length - 1] < maxContribution) {
      activeLevels.push(maxContribution);
    }

    const pots = [];
    let previousLevel = 0;

    for (const level of activeLevels) {
      const cap = level - previousLevel;
      if (cap <= 0) continue;

      let potAmount = 0;
      const eligiblePlayers = [];

      for (const entry of entries) {
        const available = Math.max(0, entry.amount - previousLevel);
        const taken = Math.min(available, cap);
        if (taken > 0) {
          potAmount += taken;
          if (!entry.folded && entry.amount >= level) {
            eligiblePlayers.push(entry.playerId);
          }
        }
      }

      if (potAmount > 0) {
        if (
          pots.length > 0 &&
          pots[pots.length - 1].eligiblePlayers.length === eligiblePlayers.length &&
          pots[pots.length - 1].eligiblePlayers.every((id, i) => id === eligiblePlayers[i])
        ) {
          pots[pots.length - 1].amount += potAmount;
        } else {
          pots.push({
            amount: potAmount,
            eligiblePlayers
          });
        }
      }

      previousLevel = level;
    }

    return pots;
  }
}