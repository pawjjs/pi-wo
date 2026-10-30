import { openApiComponents } from "./components.js";
import { authPaths } from "./auth.openapi.js";
import { tablesPaths } from "./tables.openapi.js";

export const openApiDefinition = {
    openapi: "3.0.0",
    info: {
        title: "API pokera Pi Wo",
        version: "1.0.0",
        description: "REST API aplikacji pokerowej Pi Wo.",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: openApiComponents,
    paths: {
        ...authPaths,
        ...tablesPaths,
    },
};
