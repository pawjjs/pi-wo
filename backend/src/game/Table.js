import { Deck } from './Deck.js';
import { PotManager } from './PotManager.js';

export class Table {
    constructor({
        id,
        name,
        minBet,
        bigBet,
        decisionTimeSec = 30,
        maxBuyIn = 1000,
        maxPlayers = 6,
        seats = [],
    }) {
        this.id = id;
        this.name = name;
        this.minBet = minBet;
        this.bigBet = bigBet ?? minBet * 2;
        this.decisionTimeSec = decisionTimeSec;
        this.turnTimeMs = decisionTimeSec * 1000;
        this.maxBuyIn = maxBuyIn;
        this.maxPlayers = maxPlayers;

        this.deck = new Deck();
        this.potManager = new PotManager();

        this.status = 'waiting';
        this.stage = null;
        this.communityCards = [];
        this.dealerIndex = -1;
        this.currentTurnIndex = -1;
        this.currentBet = 0;
        this.minRaise = this.bigBet;
        this.lastHandResult = null;
        this.handHistory = [];

        this.seats = Array.from({ length: maxPlayers }, (_, index) => {
            const seat = seats[index];
            if (!seat) return null;
            return {
                seatIndex: index,
                playerId: seat.playerId,
                userId: seat.userId ?? null,
                nickname: seat.nickname,
                ready: Boolean(seat.ready),
                chips: seat.chips ?? this.maxBuyIn,
                holeCards: [],
                currentBet: 0,
                folded: false,
                allIn: false,
                actedInRound: false,
            };
        });
    }

    findPlayerSeatIndex(identifier) {
        return this.seats.findIndex(
            seat => seat && (seat.playerId === identifier || seat.nickname === identifier)
        );
    }

    getActiveSeats() {
        return this.seats.filter(seat => seat !== null && !seat.folded);
    }

    getNextOccupiedSeat(fromIndex, onlyCanAct = false) {
        for (let offset = 1; offset <= this.maxPlayers; offset++) {
            const idx = (fromIndex + offset) % this.maxPlayers;
            const seat = this.seats[idx];
            if (!seat || seat.folded) continue;
            if (onlyCanAct && seat.allIn) continue;
            return idx;
        }
        return -1;
    }

    startHand() {
        const eligible = this.seats.filter(seat => seat !== null && seat.chips > 0);
        if (eligible.length < 2) {
            throw new Error('Not enough players to start the hand.');
        }

        this.deck.reset();
        this.potManager.reset();
        this.communityCards = [];
        this.status = "playing";
        this.stage = "preflop";
        this.currentBet = 0;
        this.minRaise = this.bigBet;
        this.lastHandResult = null;
        this.handHistory = [];

        for (const seat of this.seats) {
            if (!seat) continue;
            if (seat.chips > 0) {
                seat.holeCards = this.deck.draw(2);
                seat.currentBet = 0;
                seat.folded = false;
                seat.allIn = false;
                seat.actedInRound = false;
            } else {
                seat.holeCards = [];
                seat.folded = true;
            }
        }

        this.dealerIndex = this.getNextOccupiedSeat(this.dealerIndex);
        const sbIndex = eligible.length === 2 ? this.dealerIndex : this.getNextOccupiedSeat(this.dealerIndex);
        const bbIndex = this.getNextOccupiedSeat(sbIndex);

        this.postBlind(sbIndex, this.minBet);
        this.postBlind(bbIndex, this.bigBet);

        this.currentBet = Math.max(this.seats[sbIndex].currentBet, this.seats[bbIndex].currentBet);
        this.currentTurnIndex = this.getNextOccupiedSeat(bbIndex, true);
        return this.getPublicState();
    }

    postBlind(seatIndex, blindAmount) {
        const seat = this.seats[seatIndex];
        const paid = Math.min(seat.chips, blindAmount);
        seat.chips -= paid;
        seat.currentBet += paid;
        if (seat.chips === 0) {
            seat.allIn = true;
        }
        this.potManager.addContribution(seat.playerId, paid);
        this.handHistory.push({
            stage: "preflop",
            playerId: seat.playerId,
            action: "blind",
            amount: paid,
        });
    }

    getPlayerHoleCards(identifier) {
        const idx = this.findPlayerSeatIndex(identifier);
        if (idx === -1) return [];
        return this.seats[idx].holeCards;
    }

    getPublicState() {
        return {
            id: this.id,
            name: this.name,
            minBet: this.minBet,
            bigBet: this.bigBet,
            decisionTimeSec: this.decisionTimeSec,
            maxBuyIn: this.maxBuyIn,
            maxPlayers: this.maxPlayers,
            status: this.status,
            stage: this.stage,
            pot: this.potManager.totalPot,
            currentBet: this.currentBet,
            minRaise: this.minRaise,
            dealerIndex: this.dealerIndex,
            currentTurnIndex: this.currentTurnIndex,
            communityCards: this.communityCards,
            seats: this.seats.map(seat =>
                seat
                ? {
                    seatIndex: seat.seatIndex,
                    playerId: seat.playerId,
                    userId: seat.userId,
                    nickname: seat.nickname,
                    ready: seat.ready,
                    chips: seat.chips,
                    currentBet: seat.currentBet,
                    folded: seat.folded,
                    allIn: seat.allIn,
                } : null
            ),
            lastHandResult: this.lastHandResult
        };
    }
}