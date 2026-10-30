export const authPaths = {
    "/api/v1/auth/register": {
        post: {
            tags: ["Auth"],
            summary: "Zarejestruj gracza",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["username", "email", "password"],
                            properties: {
                                username: { type: "string", example: "GraczA" },
                                email: { type: "string", format: "email", example: "gracz@example.com" },
                                password: { type: "string", minLength: 6, format: "password" },
                            },
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: "Konto zostało utworzone",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/RegisterResponse" },
                        },
                    },
                },
                400: {
                    description: "Nieprawidłowe dane rejestracji",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                        },
                    },
                },
                409: {
                    description: "Nazwa użytkownika lub adres e-mail już istnieje",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                        },
                    },
                },
            },
        },
    },
    "/api/v1/auth/login": {
        post: {
            tags: ["Auth"],
            summary: "Zaloguj gracza",
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["email", "password"],
                            properties: {
                                email: { type: "string", format: "email" },
                                password: { type: "string", format: "password" },
                            },
                        },
                    },
                },
            },
            responses: {
                200: {
                    description: "Logowanie zakończyło się powodzeniem",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/RegisterResponse" },
                        },
                    },
                },
                400: { description: "Adres e-mail i hasło są wymagane" },
                401: { description: "Nieprawidłowe dane logowania" },
            },
        },
    },
};
