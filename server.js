import express from "express";

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("Hello from Express!");
});

app.get("/about", (req, res) => {
    res.send("This is the about page!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});