import cors from "cors";
import init from "./init.js";
import express from "express";
import router from "./routes/api.js";
import { db } from "./database/db.js";
import Redis from "./database/redis.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { BASE_PATH, CLIENT_URL, PORT } from "./constants.js";
import { requestLogger } from "./middlewares/logger/loggers.js";

const app = express();

app.use(
    cors({
        origin: [CLIENT_URL, "http://localhost:5018"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(BASE_PATH, router);
app.use(errorHandler);

app.on("close", async () => {
    await db.close();
    await Redis.close();

    console.log("Server closed");

    process.exit(0);
});

await db.init();
await Redis.init();
await init();

app.listen(PORT, async () => {
    console.log(`\nServer is running on port ${PORT}`);
});

process.on("SIGINT", () => {
    app.emit("close");
});

process.on("SIGTERM", () => {
    app.emit("close");
});
