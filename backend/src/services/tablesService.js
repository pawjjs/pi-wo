import * as tablesRepository from "../repositories/tablesRepository.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors.js";

export const MAX_PLAYERS = 6;
const DEFAULT_COUNTDOWN_DURATIONS = { all_ready: 5_000, majority_ready: 15_000 };
let countdownDurations = { ...DEFAULT_COUNTDOWN_DURATIONS };
const countdownTimers = new Map();

function occupiedSeats(table) {
    return table.seats.filter(Boolean);
}

function findSeat(table, nickname) {
    return table.seats.find((seat) => seat?.nickname === nickname) ?? null;
}

function isMajorityReady(table) {
    const players = occupiedSeats(table);
    return players.length >= 2 && players.filter((seat) => seat.ready).length > players.length / 2;
}

function isAllReady(table) {
    const players = occupiedSeats(table);
    return players.length >= 2 && players.every((seat) => seat.ready);
}

function getReadyMode(table) {
    if (isAllReady(table)) return "all_ready";
    if (isMajorityReady(table)) return "majority_ready";
    return null;
}

function clearCountdownTimer(tableId) {
    const timer = countdownTimers.get(tableId);
    if (timer) clearTimeout(timer);
    countdownTimers.delete(tableId);
}

function cancelCountdown(table, { resetReady = false } = {}) {
    clearCountdownTimer(table.id);
    table.status = "waiting";
    table.countdownMode = null;
    table.countdownEndsAt = null;
    if (resetReady) {
        table.seats.forEach((seat) => {
            if (seat) seat.ready = false;
        });
    }
}

function scheduleCountdown(table, mode) {
    clearCountdownTimer(table.id);
    table.status = "countdown";
    table.countdownMode = mode;
    table.countdownEndsAt = new Date(Date.now() + countdownDurations[mode]).toISOString();
    const timer = setTimeout(() => {
        finalizeCountdownIfDue(table.id).catch((error) => {
            console.error(`Failed to finalize countdown for table ${table.id}:`, error);
        });
    }, countdownDurations[mode]);
    timer.unref?.();
    countdownTimers.set(table.id, timer);
}

function refreshCountdown(table) {
    const mode = getReadyMode(table);
    if (!mode) {
        if (table.status === "countdown") cancelCountdown(table);
        return;
    }
    if (table.status !== "countdown" || table.countdownMode !== mode) {
        scheduleCountdown(table, mode);
    }
}

function createGameSession(table) {
    return {
        sessionId: `game-${table.id}-${Date.now()}`,
        startedAt: new Date().toISOString(),
        players: occupiedSeats(table).map((seat) => ({ ...seat })),
    };
}

export async function listTables({ available = false } = {}) {
    const tables = await tablesRepository.findAll();
    return available
        ? tables.filter((table) => table.status === "waiting" && occupiedSeats(table).length < MAX_PLAYERS)
        : tables;
}

export async function getTable(id) {
    const table = await tablesRepository.findById(id);
    if (!table) throw new NotFoundError("Table not found");
    if (table.status === "countdown") {
        await finalizeCountdownIfDue(id);
    }
    return table;
}

export async function createTable({ name, minBet, bigBet, decisionTimeSec, maxBuyIn, nickname }) {
    return tablesRepository.create({
        name,
        minBet,
        bigBet,
        decisionTimeSec,
        maxBuyIn,
        hostNickname: nickname,
    });
}

export async function joinTable(id, nickname) {
    const table = await getTable(id);
    if (table.status !== "waiting") throw new ConflictError("Table is not accepting players");
    if (table.kickedNicknames.includes(nickname)) throw new ConflictError("Player is blocked from this table");
    if (occupiedSeats(table).some((seat) => seat.nickname === nickname)) {
        throw new ConflictError("Player already at this table");
    }
    if (occupiedSeats(table).length >= MAX_PLAYERS) throw new ConflictError("Table is full");
    return tablesRepository.addPlayer(id, nickname);
}

export async function setPlayerReady(id, nickname, ready) {
    const table = await getTable(id);
    if (table.status !== "waiting" && table.status !== "countdown") {
        throw new ConflictError("Table is not accepting readiness changes");
    }
    const seat = findSeat(table, nickname);
    if (!seat) throw new ConflictError("Player is not at this table");
    seat.ready = ready;
    refreshCountdown(table);
    return table;
}

export async function kickPlayer(id, hostNickname, targetNickname) {
    const table = await getTable(id);
    if (table.hostNickname !== hostNickname) throw new ForbiddenError("Only the host can kick players");
    if (table.status === "playing" || table.status === "closed") {
        throw new ConflictError("Player cannot be kicked in this table state");
    }
    const target = findSeat(table, targetNickname);
    if (!target) throw new ConflictError("Player is not at this table");
    if (target.nickname === hostNickname) throw new ConflictError("Host cannot kick itself");
    table.kickedNicknames.push(target.nickname);
    table.kickedPlayerIds.push(target.playerId);
    await tablesRepository.removePlayer(id, target.nickname);
    if (table.status === "countdown") cancelCountdown(table, { resetReady: true });
    return table;
}

export async function leaveTable(id, nickname) {
    const table = await getTable(id);
    const player = findSeat(table, nickname);
    if (!player) throw new ConflictError("Player is not at this table");
    if (table.hostNickname === nickname) {
        clearCountdownTimer(table.id);
        table.status = "closed";
        table.countdownMode = null;
        table.countdownEndsAt = null;
        return table;
    }
    await tablesRepository.removePlayer(id, nickname);
    if (table.status === "countdown") cancelCountdown(table, { resetReady: true });
    return table;
}

export async function startTable(id, nickname) {
    const table = await getTable(id);
    if (table.hostNickname !== nickname) throw new ForbiddenError("Only the host can start the table");
    if (table.status === "playing") return table;
    if (table.status !== "countdown" || !table.countdownEndsAt) {
        throw new ConflictError("Table countdown has not started");
    }
    if (Date.now() < Date.parse(table.countdownEndsAt)) {
        throw new ConflictError("Table countdown has not finished");
    }
    return finalizeCountdownIfDue(id);
}

export async function finalizeCountdownIfDue(id) {
    const table = await tablesRepository.findById(id);
    if (!table || table.status !== "countdown") return table;
    const mode = table.countdownMode;
    const due = Date.now() >= Date.parse(table.countdownEndsAt);
    if (!due) return table;
    if (occupiedSeats(table).length < 2 || getReadyMode(table) !== mode) {
        cancelCountdown(table);
        return table;
    }
    clearCountdownTimer(table.id);
    table.status = "playing";
    table.countdownMode = null;
    table.countdownEndsAt = null;
    table.gameSession = createGameSession(table);
    // TODO(socket-io): broadcast table:state after the realtime transport is added.
    // TODO(game-engine): pass the table snapshot to the game engine in a later commit.
    return table;
}

export function setCountdownDurationsForTests(durations = DEFAULT_COUNTDOWN_DURATIONS) {
    countdownDurations = { ...DEFAULT_COUNTDOWN_DURATIONS, ...durations };
}

export function clearCountdownTimersForTests() {
    for (const tableId of countdownTimers.keys()) clearCountdownTimer(tableId);
    countdownDurations = { ...DEFAULT_COUNTDOWN_DURATIONS };
}
