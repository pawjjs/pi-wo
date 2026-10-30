import * as tablesService from "../services/tablesService.js";
import { ValidationError } from "../utils/errors.js";

export async function getTables(req, res) {
    const available = req.query.available === "true";
    res.json(await tablesService.listTables({ available }));
}

export async function getTableById(req, res) {
    res.json(await tablesService.getTable(Number(req.params.id)));
}

export async function createTable(req, res) {
    const { name, minBet } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || !Number.isInteger(minBet) || minBet <= 0) {
        throw new ValidationError("Invalid table data");
    }
    res.status(201).json(await tablesService.createTable({ name: name.trim(), minBet }));
}

export async function joinTable(req, res) {
    const { nickname } = req.body ?? {};
    if (typeof nickname !== "string" || !nickname.trim()) {
        throw new ValidationError("Nickname is required");
    }
    res.status(201).json(await tablesService.joinTable(Number(req.params.id), nickname.trim()));
}