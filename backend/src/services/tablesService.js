import * as tablesRepository from "../repositories/tablesRepository.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";

export const MAX_PLAYERS = 6;

export async function listTables({ available = false } = {}) {
    const tables = await tablesRepository.findAll();
    return available ? tables.filter(t => t.players.length < MAX_PLAYERS) : tables;
}

export async function getTable(id) {
    const table = await tablesRepository.findById(id);
    if (!table) throw new NotFoundError("Table not found");
    return table;
}

export async function createTable({ name, minBet }) {
    return tablesRepository.create({ name, minBet, bigBet: minBet * 2 });
}

export async function joinTable(id, nickname) {
    const table = await getTable(id);
    if (table.players.includes(nickname)) throw new ConflictError("Player already at this table");
    if (table.players.length >= MAX_PLAYERS) throw new ConflictError("Table is full");
    return tablesRepository.addPlayer(id, nickname);
}