import express from "express";
import { getTables, getTableById, createTable, joinTable } from "../controllers/tablesController.js";

const router = express.Router();

router.get("/", getTables);
router.get("/:id", getTableById);
router.post("/", createTable);
router.post("/:id/join", joinTable);

export default router;