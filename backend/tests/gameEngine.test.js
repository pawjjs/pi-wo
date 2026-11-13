import assert from "node:assert/strict";
import { test } from "node:test";
import { Deck } from "../src/game/Deck.js";
import { PotManager } from "../src/game/PotManager.js";
import { HandEvaluator } from "../src/game/HandEvaluator.js";
import { Table } from "../src/game/Table.js";

test("Deck tworzy 52 karty unikalne i pozwala je dobierac", () => {
    const deck = new Deck();
    assert.equal(deck.remaining, 52);
    const drawn = deck.draw(5);
    assert.equal(drawn.length, 5);
    assert.equal(deck.remaining, 47);
});

test("PotManager oblicza pule glowna oraz pule boczna przy zagraniu all-in", () => {
    const pm = new PotManager();
    pm.addContribution("p1", 100);
    pm.addContribution("p2", 300);
    pm.addContribution("p3", 300);

    const pots = pm.calculatePots();
    assert.equal(pots.length, 2);
    assert.equal(pots[0].amount, 300);
    assert.deepEqual(pots[0].eligiblePlayers, ["p1", "p2", "p3"]);
    assert.equal(pots[1].amount, 400);
    assert.deepEqual(pots[1].eligiblePlayers, ["p2", "p3"]);
});

test("HandEvaluator poprawnie wylania zwyciezce z 7 kart", () => {
    const result = HandEvaluator.findWinners(
        [
            {playerId: "p1", holeCards: ["As", "Ks"] },
            {playerId: "p2", holeCards: ["2c", "7d"] },
        ],
        ["Qs", "Js", "Ts", "3h", "9d"]
    );
    assert.deepEqual(result.winners, ["p1"]);
    assert.equal(result.bestHand.categoryName, "Straight Flush");
});

test("Table rozdaje po dwie karty i pobiera blindy na starcie rozdania", () => {
    const table = new Table({
        id: 1,
        name: "Test Table",
        minBet: 5,
        bigBet: 10,
        seats: [
            { playerId: "p1", nickname: "Milosz", ready: true },
            { playerId: "p2", nickname: "Michal", ready: true },
            null,
            null,
            null,
            null
        ]
    });

    const state = table.startHand();
    assert.equal(state.status, "playing");
    assert.equal(state.stage, "preflop");
    assert.equal(state.pot, 15);
    assert.equal(table.getPlayerHoleCards("Milosz").length, 2);
    assert.equal(table.getPlayerHoleCards("Michal").length, 2);
});