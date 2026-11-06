const tableIdParameter = {
    in: "path",
    name: "id",
    required: true,
    schema: { type: "integer", minimum: 1 },
};

const nicknameProperty = {
    nickname: { type: "string", minLength: 1, example: "GraczA" },
};

const tableResponse = {
    content: {
        "application/json": {
            schema: { $ref: "#/components/schemas/Table" },
        },
    },
};

const errorResponses = {
    400: {
        description: "Nieprawidłowe dane wejściowe.",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    404: { description: "Nie znaleziono stołu." },
    409: { description: "Operacja jest niedozwolona w aktualnym stanie stołu." },
};

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
                    description: "Jeśli true, zwraca tylko stoły w stanie waiting z wolnymi miejscami.",
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
                            required: ["name", "minBet", "nickname"],
                            properties: {
                                name: { type: "string", minLength: 1, example: "Wieczorny stół" },
                                minBet: { type: "integer", minimum: 1, example: 5 },
                                bigBet: { type: "integer", minimum: 1, example: 10 },
                                decisionTimeSec: { type: "integer", minimum: 1, example: 30 },
                                maxBuyIn: { type: "integer", minimum: 1, example: 1000 },
                                ...nicknameProperty,
                            },
                        },
                    },
                },
            },
            responses: {
                201: { description: "Stół został utworzony.", ...tableResponse },
                400: { description: "Nieprawidłowe dane stołu lub nick hosta." },
            },
        },
    },
    "/api/v1/tables/{id}": {
        get: {
            tags: ["Tables"],
            summary: "Pobierz dane stołu",
            parameters: [tableIdParameter],
            responses: {
                200: {
                    description: "Szczegóły stołu. Podczas countdown odpowiedź zawiera również serverTime.",
                    ...tableResponse,
                },
                400: { description: "Id stołu musi być dodatnią liczbą całkowitą." },
                404: { description: "Nie znaleziono stołu." },
            },
        },
    },
    "/api/v1/tables/{id}/join": {
        post: {
            tags: ["Tables"],
            summary: "Dołącz do stołu",
            parameters: [tableIdParameter],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nickname"],
                            properties: nicknameProperty,
                        },
                    },
                },
            },
            responses: {
                201: { description: "Gracz dołączył do stołu.", ...tableResponse },
                400: { description: "Nieprawidłowy identyfikator stołu lub nick." },
                404: { description: "Nie znaleziono stołu." },
                409: { description: "Stół nie przyjmuje graczy, jest pełny, nick jest zajęty lub zablokowany." },
            },
        },
    },
    "/api/v1/tables/{id}/ready": {
        patch: {
            tags: ["Tables"],
            summary: "Ustaw lub cofnij gotowość gracza",
            parameters: [tableIdParameter],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nickname", "ready"],
                            properties: {
                                ...nicknameProperty,
                                ready: { type: "boolean", example: true },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Gotowość została zmieniona.", ...tableResponse },
                ...errorResponses,
            },
        },
    },
    "/api/v1/tables/{id}/kick": {
        post: {
            tags: ["Tables"],
            summary: "Wyrzuć gracza ze stołu",
            parameters: [tableIdParameter],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nickname", "targetNickname"],
                            properties: {
                                ...nicknameProperty,
                                targetNickname: { type: "string", minLength: 1, example: "GraczB" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: { description: "Gracz został wyrzucony.", ...tableResponse },
                ...errorResponses,
                403: { description: "Tylko host może wyrzucać graczy." },
            },
        },
    },
    "/api/v1/tables/{id}/leave": {
        post: {
            tags: ["Tables"],
            summary: "Opuść stół",
            parameters: [tableIdParameter],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nickname"],
                            properties: nicknameProperty,
                        },
                    },
                },
            },
            responses: {
                200: { description: "Gracz opuścił stół lub host zamknął stół.", ...tableResponse },
                ...errorResponses,
            },
        },
    },
    "/api/v1/tables/{id}/start": {
        post: {
            tags: ["Tables"],
            summary: "Sfinalizuj odliczanie i rozpocznij grę",
            parameters: [tableIdParameter],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["nickname"],
                            properties: nicknameProperty,
                        },
                    },
                },
            },
            responses: {
                200: { description: "Gra została rozpoczęta lub start był idempotentny.", ...tableResponse },
                ...errorResponses,
                403: { description: "Tylko host może rozpocząć grę." },
            },
        },
    },
};
