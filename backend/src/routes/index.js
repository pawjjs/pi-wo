import express from "express";
import authRouter from "./authRoutes.js";
import tablesRouter from "./tablesRoutes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/tables", tablesRouter);

export default router;
