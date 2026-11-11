import http from "node:http";
import app from "./app.js";
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT ?? 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (client) => {
    client.send('siema');

    client.on('message', (msg) => {
        console.log(`client ${msg}`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
