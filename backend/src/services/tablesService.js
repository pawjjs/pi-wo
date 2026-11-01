import * as tablesRepository from "../repositories/tablesRepository.js";
import { ConflictError, NotFoundError } from "../utils/errors.js";

export const MAX_PLAYERS = 6;

function occupiedSeats(table) {
    return table.seats.filter(Boolean);
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
