import * as tablesService from "../services/tablesService.js";
import {
    validateCreateTable,
    validateKick,
    validateLeave,
    validateNickname,
    validateReady,
    validateStart,
    validateTableId,
} from "../validators/tableValidator.js";

export async function getTables(req, res) {
    const available = req.query.available === "true";
    res.json(await tablesService.listTables({ available }));
}

export async function getTableById(req, res) {
    const table = await tablesService.getTable(validateTableId(req.params.id));
    res.json(table.status === "countdown"
        ? { ...table, serverTime: new Date().toISOString() }
        : table);
}

export async function createTable(req, res) {
    const input = validateCreateTable(req.body);
    const nickname = validateNickname(req.body);
    res.status(201).json(await tablesService.createTable({ ...input, nickname }));
}

export async function joinTable(req, res) {
    const id = validateTableId(req.params.id);
    const nickname = validateNickname(req.body);
    res.status(201).json(await tablesService.joinTable(id, nickname));
}

export async function setReady(req, res) {
    const id = validateTableId(req.params.id);
    const { nickname, ready } = validateReady(req.body);
    res.json(await tablesService.setPlayerReady(id, nickname, ready));
}

export async function kickPlayer(req, res) {
    const id = validateTableId(req.params.id);
    const { nickname, targetNickname } = validateKick(req.body);
    res.json(await tablesService.kickPlayer(id, nickname, targetNickname));
}

export async function leaveTable(req, res) {
    const id = validateTableId(req.params.id);
    const nickname = validateLeave(req.body);
    res.json(await tablesService.leaveTable(id, nickname));
}

export async function startTable(req, res) {
    const id = validateTableId(req.params.id);
    const nickname = validateStart(req.body);
    res.json(await tablesService.startTable(id, nickname));
}
