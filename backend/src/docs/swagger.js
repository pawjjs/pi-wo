import swaggerUi from "swagger-ui-express";
import { openApiDefinition } from "./openapi/index.js";

export const swaggerSpec = openApiDefinition;

export function mountSwagger(app) {
    app.get("/api-docs.json", (req, res) => {
        res.json(swaggerSpec);
    });
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
