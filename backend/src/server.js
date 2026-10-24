import express from "express";
import authRouter from "./routes/authRoutes.js";

const app = express();
const PORT = 3000;
const MAX_PLAYERS = 6;

let testplayer = [
    { pid: 1, nick: "Michał" },
    { pid: 2, nick: "Miłosz" }
]
let nextPID = 3;

let tables = [
    { id: 1, name: "Old Table", minBet: 5, bigBet: 10, players: ["Miłosz", "Miłosz", "Michał", "Michał", "Maciek"] },
    { id: 2, name: "High Table", minBet: 50, bigBet: 100, players: ["Miłosz", "Michał", "Maciek"] },
    { id: 3, name: "Full Table", minBet: 5, bigBet: 10, players: ["Miłosz", "Miłosz", "Michał", "Michał", "Maciek","Maciek"] }
];  
let nextId = 4;

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.get("/api/tables", (req, res) => {
    const { available } = req.query;
    let result = tables;
    if (available === "true") {
        result = tables.filter(t => t.players.length < MAX_PLAYERS);
    }
    res.json(result);
});

app.get("/api/tables/:id", (req, res) => {
    const id = Number(req.params.id);
    const table = tables.find(t => t.id === id);
    if (!table) {
        return res.status(404).json({ error: "Table not found" });
    }
    res.json(table);
});

app.post("/api/tables", (req, res) => {
    const { name, minBet } = req.body ?? {};
    if (
        typeof name !== "string" ||
        !name.trim() ||
        !Number.isInteger(minBet) ||
        minBet <= 0
    ) {
        return res.status(400).json({ error: "Invalid table data" });
    }
    const newTable = {
        id: nextId++,
        name: name.trim(),
        minBet,
        bigBet: minBet * 2,
        players: []
    };
    tables.push(newTable);
    res.status(201).json(newTable);
});

app.post("/api/tables/:id/join", (req, res) => {
    const id = Number(req.params.id);
    const table = tables.find(t => t.id === id);
    if (!table) {
        return res.status(404).json({ error: "Table not found" });
    }
    const { nickname } = req.body ?? {};
    if (typeof nickname !== "string" || !nickname.trim()) {
        return res.status(400).json({ error: "Nickname is required" });
    }
    if (table.players.includes(nickname.trim())) {
        return res.status(404).json({ error: "Player already at this table" });
    }
    if (table.players.length >= MAX_PLAYERS) {
        return res.status(404).json({ error: "Table is full" });
    }
    table.players.push(nickname.trim());
    res.status(201).json(table);
});

app.use("/api/v1/auth", authRouter);

app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status ?? 500).json({ error: err.status ? err.message : "Internal Server Error" });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
