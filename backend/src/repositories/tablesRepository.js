const MAX_PLAYERS = 6;

function createSeat(tableId, seatNumber, nickname) {
    if (!nickname) return null;
    return {
        playerId: `player-${tableId}-${seatNumber}`,
        userId: null,
        nickname,
        ready: false,
    };
}

function createSeedTables() {
    return [
        {
            id: 1,
            name: "Old Table",
            minBet: 5,
            bigBet: 10,
            decisionTimeSec: 30,
            maxBuyIn: 1000,
            maxPlayers: MAX_PLAYERS,
            status: "waiting",
            hostNickname: "Miloz",
            hostPlayerId: "player-1-1",
            kickedNicknames: [],
            kickedPlayerIds: [],
            seats: [
                createSeat(1, 1, "Miloz"),
                createSeat(1, 2, "Michal"),
                createSeat(1, 3, "Maciek"),
                null,
                null,
                null,
            ],
            countdownMode: null,
            countdownEndsAt: null,
            gameSession: null,
        },
        {
            id: 2,
            name: "High Table",
            minBet: 50,
            bigBet: 100,
            decisionTimeSec: 30,
            maxBuyIn: 1000,
            maxPlayers: MAX_PLAYERS,
            status: "waiting",
            hostNickname: "Miloz",
            hostPlayerId: "player-2-1",
            kickedNicknames: [],
            kickedPlayerIds: [],
            seats: [
                createSeat(2, 1, "Miloz"),
                createSeat(2, 2, "Michal"),
                createSeat(2, 3, "Maciek"),
                null,
                null,
                null,
            ],
            countdownMode: null,
            countdownEndsAt: null,
            gameSession: null,
        },
        {
            id: 3,
            name: "Full Table",
            minBet: 5,
            bigBet: 10,
            decisionTimeSec: 30,
            maxBuyIn: 1000,
            maxPlayers: MAX_PLAYERS,
            status: "waiting",
            hostNickname: "Miloz",
            hostPlayerId: "player-3-1",
            kickedNicknames: [],
            kickedPlayerIds: [],
            seats: [
                createSeat(3, 1, "Miloz"),
                createSeat(3, 2, "Michal"),
                createSeat(3, 3, "Maciek"),
                createSeat(3, 4, "Olek"),
                createSeat(3, 5, "Pawel"),
                createSeat(3, 6, "Kuba"),
            ],
            countdownMode: null,
            countdownEndsAt: null,
            gameSession: null,
        },
    ];
}

let tables = createSeedTables();
let nextId = 4;

export async function findAll() {
    return tables;
}

export async function findById(id) {
    return tables.find((table) => table.id === id) ?? null;
}

export async function create({ name, minBet, bigBet, decisionTimeSec, maxBuyIn, hostNickname }) {
    const id = nextId++;
    const table = {
        id,
        name,
        minBet,
        bigBet,
        decisionTimeSec,
        maxBuyIn,
        maxPlayers: MAX_PLAYERS,
        status: "waiting",
        hostNickname,
        hostPlayerId: `player-${id}-1`,
        kickedNicknames: [],
        kickedPlayerIds: [],
        seats: [createSeat(id, 1, hostNickname), null, null, null, null, null],
        countdownMode: null,
        countdownEndsAt: null,
        gameSession: null,
    };
    tables.push(table);
    return table;
}

export async function addPlayer(id, nickname) {
    const table = await findById(id);
    const seatIndex = table.seats.findIndex((seat) => seat === null);
    table.seats[seatIndex] = createSeat(id, seatIndex + 1, nickname);
    return table;
}

export async function removePlayer(id, nickname) {
    const table = await findById(id);
    const seatIndex = table.seats.findIndex((seat) => seat?.nickname === nickname);
    if (seatIndex >= 0) table.seats[seatIndex] = null;
    return table;
}

export function resetRepositoryForTests() {
    tables = createSeedTables();
    nextId = 4;
}
