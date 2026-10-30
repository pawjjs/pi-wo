export const tablesPaths = {
    "/api/v1/tables": {
        get: {
            tags: ["Tables"],
            summary: "Pobierz listę stołów",
            parameters: [
                {
                    in: "query",
                    name: "available",
                    schema: { type: "boolean" },
                    description: "Jeśli true, zwraca stoły z wolnymi miejscami.",
                },
            ],
            responses: {
                200: {
                    description: "Lista stołów",
                    content: {
                        "application/json": {
                            schema: {
                                type: "array",
                                items: { $ref: "#/components/schemas/Table" },
                            },
                        },
                    },
                },
            },
        },
        post: {
            tags: ["Tables"],
            summary: "Utwórz stół",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["name", "minBet"],
                            properties: {
                                name: { type: "string", example: "Wieczorny stół" },
                                minBet: { type: "integer", minimum: 1, example: 5 },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Stół został utworzony",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Table" },
                        },
                    },
                },
                400: { description: "Nieprawidłowe dane stołu" },
            },
        },
    },
    "/api/v1/tables/{id}": {
        get: {
            tags: ["Tables"],
            summary: "Pobierz dane stołu",
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            responses: {
                200: {
                    description: "Szczegóły stołu",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Table" },
                        },
                    },
                },
                404: { description: "Nie znaleziono stołu" },
            },
        },
    },
    "/api/v1/tables/{id}/join": {
        post: {
            tags: ["Tables"],
            summary: "Dołącz do stołu",
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "integer" },
                },
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nickname"],
                            properties: {
                                nickname: { type: "string", example: "GraczA" },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Gracz dołączył do stołu",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/Table" },
                        },
                    },
                },
                400: { description: "Nazwa gracza jest wymagana" },
                404: { description: "Nie znaleziono stołu" },
                409: { description: "Konflikt podczas dołączania do stołu" },
            },
        },
    },
};
