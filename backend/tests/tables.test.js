import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import http from "node:http";
import app from "../src/app.js";
import { resetRepositoryForTests } from "../src/repositories/tablesRepository.js";
import {
    clearCountdownTimersForTests,
    setCountdownDurationsForTests,
} from "../src/services/tablesService.js";

let server;
let baseUrl;

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            "content-type": "application/json",
            ...(options.headers || {}),
        },
    });
    return { status: response.status, body: await response.json() };
}

async function createTable(nickname = "Host") {
    const result = await request("/api/v1/tables", {
        method: "POST",
        body: JSON.stringify({ name: "Test table", minBet: 5, nickname }),
    });
    assert.equal(result.status, 201);
    return result.body;
}

async function join(tableId, nickname) {
    const result = await request(`/api/v1/tables/${tableId}/join`, {
        method: "POST",
        body: JSON.stringify({ nickname }),
    });
    assert.equal(result.status, 201);
    return result.body;
}

async function ready(tableId, nickname, value = true) {
    return request(`/api/v1/tables/${tableId}/ready`, {
        method: "PATCH",
        body: JSON.stringify({ nickname, ready: value }),
    });
}

before(async () => {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
    resetRepositoryForTests();
    clearCountdownTimersForTests();
    setCountdownDurationsForTests({ all_ready: 30, majority_ready: 30 });
});

after(async () => {
    clearCountdownTimersForTests();
    await new Promise((resolve) => server.close(resolve));
});

test("publikuje OpenAPI dla wszystkich tras cyklu życia stołu", async () => {
    const result = await request("/api-docs.json");
    assert.equal(result.status, 200);
    assert.ok(result.body.components.schemas.Seat);
    assert.ok(result.body.components.schemas.GameSession);
    assert.equal(result.body.components.schemas.Table.properties.players, undefined);
    for (const suffix of ["", "/{id}", "/{id}/join", "/{id}/ready", "/{id}/kick", "/{id}/leave", "/{id}/start"]) {
        assert.ok(result.body.paths[`/api/v1/tables${suffix}`]);
    }
});

test("tworzy stół z hostem na miejscu zerowym", async () => {
    const table = await createTable();
    assert.equal(table.seats[0].nickname, "Host");
    assert.equal(table.seats[0].ready, false);
    assert.equal(table.hostPlayerId, table.seats[0].playerId);
    assert.equal(table.seats.length, 6);
});

test("waliduje identyfikatory, odrzuca duplikaty nicków i blokuje pełny stół", async () => {
    assert.equal((await request("/api/v1/tables/nope")).status, 400);
    const table = await createTable();
    await join(table.id, "Guest");
    assert.equal((await request(`/api/v1/tables/${table.id}/join`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Guest" }),
    })).status, 409);

    for (const nickname of ["One", "Two", "Three", "Four"]) await join(table.id, nickname);
    assert.equal((await request(`/api/v1/tables/${table.id}/join`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Six" }),
    })).status, 409);
});

test("uruchamia odliczanie all-ready i tworzy snapshot gry", async () => {
    const table = await createTable();
    await join(table.id, "Guest");
    await ready(table.id, "Host");
    const countdown = await ready(table.id, "Guest");
    assert.equal(countdown.status, 200);
    assert.equal(countdown.body.status, "countdown");
    const details = await request(`/api/v1/tables/${table.id}`);
    assert.equal(details.body.status, "countdown");
    assert.ok(details.body.serverTime);
    assert.ok(details.body.countdownEndsAt);
    await new Promise((resolve) => setTimeout(resolve, 50));
    const started = await request(`/api/v1/tables/${table.id}`);
    assert.equal(started.body.status, "playing");
    assert.equal(started.body.gameSession.players.length, 2);
});

test("uruchamia odliczanie majority-ready i zachowuje niegotowych graczy", async () => {
    const table = await createTable();
    await join(table.id, "Guest");
    await join(table.id, "Observer");
    await ready(table.id, "Host");
    const countdown = await ready(table.id, "Guest");
    assert.equal(countdown.body.countdownMode, "majority_ready");
    await new Promise((resolve) => setTimeout(resolve, 50));
    const started = await request(`/api/v1/tables/${table.id}`);
    assert.equal(started.body.status, "playing");
    assert.equal(started.body.gameSession.players.length, 3);
    assert.equal(started.body.gameSession.players.find((player) => player.nickname === "Observer").ready, false);
});

test("odrzuca zbyt wczesny start i zapewnia idempotencję po deadline", async () => {
    const table = await createTable();
    await join(table.id, "Guest");
    await ready(table.id, "Host");
    await ready(table.id, "Guest");

    const early = await request(`/api/v1/tables/${table.id}/start`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Host" }),
    });
    assert.equal(early.status, 409);

    await new Promise((resolve) => setTimeout(resolve, 50));
    const started = await request(`/api/v1/tables/${table.id}/start`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Host" }),
    });
    const repeated = await request(`/api/v1/tables/${table.id}/start`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Host" }),
    });
    assert.equal(started.status, 200);
    assert.equal(started.body.status, "playing");
    assert.equal(repeated.status, 200);
    assert.equal(repeated.body.gameSession.sessionId, started.body.gameSession.sessionId);
});

test("anuluje odliczanie, gdy gracz cofnie gotowość", async () => {
    const table = await createTable();
    await join(table.id, "Guest");
    await ready(table.id, "Host");
    await ready(table.id, "Guest");
    const cancelled = await ready(table.id, "Guest", false);
    assert.equal(cancelled.body.status, "waiting");
    assert.equal(cancelled.body.countdownEndsAt, null);
});

test("ogranicza kick i blokuje ponowne wejście wyrzuconego gracza", async () => {
    const table = await createTable();
    await join(table.id, "Guest");
    const forbidden = await request(`/api/v1/tables/${table.id}/kick`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Guest", targetNickname: "Host" }),
    });
    assert.equal(forbidden.status, 403);
    const kicked = await request(`/api/v1/tables/${table.id}/kick`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Host", targetNickname: "Guest" }),
    });
    assert.equal(kicked.status, 200);
    assert.deepEqual(kicked.body.kickedNicknames, ["Guest"]);
    const blocked = await request(`/api/v1/tables/${table.id}/join`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Guest" }),
    });
    assert.equal(blocked.status, 409);
});

test("zamyka stół, gdy host go opuszcza", async () => {
    const table = await createTable();
    await join(table.id, "Guest");
    const guestLeave = await request(`/api/v1/tables/${table.id}/leave`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Guest" }),
    });
    assert.equal(guestLeave.status, 200);
    assert.equal(guestLeave.body.seats.filter(Boolean).length, 1);
    const left = await request(`/api/v1/tables/${table.id}/leave`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Host" }),
    });
    assert.equal(left.status, 200);
    assert.equal(left.body.status, "closed");
    const joinClosed = await request(`/api/v1/tables/${table.id}/join`, {
        method: "POST",
        body: JSON.stringify({ nickname: "Guest" }),
    });
    assert.equal(joinClosed.status, 409);
});
