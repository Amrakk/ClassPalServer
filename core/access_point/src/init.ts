import express from "express";
import router from "./routes/api.js";
import redis from "./database/redis.js";
import gatewayRouter from "./routes/gatewayRouter.js";
import ApiGateway from "./services/internal/gateway.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { requestLogger } from "./middlewares/logger/loggers.js";
import ApplicationService from "./services/internal/application.js";
import { BASE_PATH, ORIGIN, SUPPORTED_PARADIGM } from "./constants.js";

import type { Express } from "express";

export let apiGateway: ApiGateway | undefined = undefined;

export default async function init(app: Express) {
    if ((await ApplicationService.getByName("Access Point")) === null) {
        const isDev = process.env.ENV === "development";

        await ApplicationService.insert([
            {
                author: "Amrakk",
                basePath: BASE_PATH,
                name: "Access Point",
                description:
                    "Access Point Service serves as the entry point for all incoming requests and authenticates the user",
                protocol: isDev ? "http" : "https",
                origin: ORIGIN,
                version: "0.0.0",
                paradigm: SUPPORTED_PARADIGM.REST,
            },
        ]);
    }

    const cache = redis.getRedis();
    const applications = (await ApplicationService.getAll({}, true))[0];

    await cache.set("applications", JSON.stringify(applications), "EX", 60 * 60 * 24);

    apiGateway = new ApiGateway(gatewayRouter);
    apiGateway.init(applications);

    app.use(requestLogger);
    app.use(express.urlencoded({ extended: true }));
    app.use(BASE_PATH, router);
    app.use(errorHandler);
}
