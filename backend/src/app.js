import express from "express";
import apiRouter from "./routes/index.js";
import { mountSwagger } from "./docs/swagger.js";

const app = express();

app.use(express.json());

// logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

mountSwagger(app);
app.use("/api/v1", apiRouter);

app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

// error handler
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status ?? 500).json({ error: err.status ? err.message : "Internal Server Error" });
});

export default app;