import cors from "cors";
import init from "./init.js";
import express from "express";
import passport from "passport";
import session from "express-session";
import { db } from "./database/db.js";
import Redis from "./database/redis.js";
import { ENV, CLIENT_URL, PORT, SESSION_SECRET } from "./constants.js";

const app = express();

const isDev = ENV === "development";

app.use(
    cors({
        origin: [CLIENT_URL, "http://localhost:5018"],
        credentials: true,
    })
);

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: !isDev,
            httpOnly: true,
            sameSite: isDev ? "lax" : "none",
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.on("close", async () => {
    await db.close();
    await Redis.close();

    console.log("Server closed");
    process.exit(0);
});

await db.init();
await Redis.init();
await init(app);

app.listen(PORT, async () => {
    console.log(`\nServer is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
    console.error(err);
    app.emit("close");
});

process.on("unhandledRejection", (err) => {
    console.error(err);
    app.emit("close");
});

process.on("SIGINT", () => {
    app.emit("close");
});

process.on("SIGTERM", () => {
    app.emit("close");
});
