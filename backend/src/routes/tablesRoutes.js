import express from "express";
import {
    getTables,
    getTableById,
    createTable,
    joinTable,
    setReady,
    kickPlayer,
    leaveTable,
    startTable,
} from "../controllers/tablesController.js";

const router = express.Router();

router.get("/", getTables);
router.get("/:id", getTableById);
router.post("/", createTable);
router.post("/:id/join", joinTable);
router.patch("/:id/ready", setReady);
router.post("/:id/kick", kickPlayer);
router.post("/:id/leave", leaveTable);
router.post("/:id/start", startTable);

export default router;