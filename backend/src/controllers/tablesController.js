import * as tablesService from "../services/tablesService.js";
import {
    validateCreateTable,
    validateNickname,
    validateTableId,
} from "../validators/tableValidator.js";

export async function getTables(req, res) {
    const available = req.query.available === "true";
    res.json(await tablesService.listTables({ available }));
}

export async function getTableById(req, res) {
    res.json(await tablesService.getTable(validateTableId(req.params.id)));
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
