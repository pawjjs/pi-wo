export const openApiComponents = {
    schemas: {
        ErrorResponse: {
            type: "object",
            required: ["error"],
            properties: {
                error: { type: "string", example: "Nieprawidłowe dane stołu" },
            },
        },
        Table: {
            type: "object",
            required: ["id", "name", "minBet", "bigBet", "players"],
            properties: {
                id: { type: "integer", example: 1 },
                name: { type: "string", example: "Wieczorny stół" },
                minBet: { type: "integer", example: 5 },
                bigBet: { type: "integer", example: 10 },
                players: {
                    type: "array",
                    items: { type: "string" },
                },
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
