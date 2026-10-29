let tables = [
    { id: 1, name: "Old Table", minBet: 5, bigBet: 10, players: ["Miłosz", "Miłosz", "Michał", "Michał", "Maciek"] },
    { id: 2, name: "High Table", minBet: 50, bigBet: 100, players: ["Miłosz", "Michał", "Maciek"] },
    { id: 3, name: "Full Table", minBet: 5, bigBet: 10, players: ["Miłosz", "Miłosz", "Michał", "Michał", "Maciek","Maciek"] }
];  
let nextId = 4;

export async function findAll() {
    return tables;
}

export async function findById(id) {
    return tables.find(t => t.id === id) ?? null;
}

export async function create({ name, minBet, bigBet }) {
    const table = { id: nextId++, name, minBet, bigBet, players: [] };
    tables.push(table);
    return table;
}

export async function addPlayer(id, nickname) {
    const table = tables.find(t => t.id === id);
    table.players.push(nickname);
    return table;
}