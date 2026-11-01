export const openApiComponents = {
    schemas: {
        ErrorResponse: {
            type: "object",
            required: ["error"],
            properties: {
                error: { type: "string", example: "Nieprawidłowe dane stołu" },
            },
        },
        Seat: {
            type: "object",
            required: ["playerId", "userId", "nickname", "ready"],
            properties: {
                playerId: { type: "string", example: "player-4-1" },
                userId: { type: "integer", nullable: true, example: null },
                nickname: { type: "string", example: "Host" },
                ready: { type: "boolean", example: false },
            },
        },
        Table: {
            type: "object",
            required: [
                "id", "name", "minBet", "bigBet", "decisionTimeSec", "maxBuyIn",
                "maxPlayers", "status", "hostNickname", "hostPlayerId",
                "kickedNicknames", "kickedPlayerIds", "seats", "countdownMode",
                "countdownEndsAt", "gameSession",
            ],
            properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Wieczorny stół" },
                minBet: { type: "integer", example: 5 },
                bigBet: { type: "integer", example: 10 },
                decisionTimeSec: { type: "integer", example: 30 },
                maxBuyIn: { type: "integer", example: 1000 },
                maxPlayers: { type: "integer", example: 6 },
                status: { type: "string", enum: ["waiting", "countdown", "playing", "closed"] },
                hostNickname: { type: "string", example: "Host" },
                hostPlayerId: { type: "string", example: "player-1-1" },
                kickedNicknames: { type: "array", items: { type: "string" } },
                kickedPlayerIds: { type: "array", items: { type: "string" } },
                seats: {
                    type: "array",
                    minItems: 6,
                    maxItems: 6,
                    items: { oneOf: [{ $ref: "#/components/schemas/Seat" }, { type: "null" }] },
                },
                countdownMode: { type: "string", nullable: true, enum: ["all_ready", "majority_ready"] },
                countdownEndsAt: { type: "string", format: "date-time", nullable: true },
                gameSession: { type: "object", nullable: true },
            },
        },
        RegisterResponse: {
            type: "object",
            properties: {
                message: { type: "string" },
                user: { $ref: "#/components/schemas/User" },
            },
        },
        User: {
            type: "object",
            properties: {
                id: { type: "integer", example: 1 },
                username: { type: "string", example: "GraczA" },
                email: { type: "string", format: "email", example: "gracz@example.com" },
                chips: { type: "integer", example: 10000 },
                role: { type: "string", example: "user" },
            },
        },
    },
};
