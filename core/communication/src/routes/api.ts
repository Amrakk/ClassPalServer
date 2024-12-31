import express from "express";
import mailRouter from "./mailRouter.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("API is working");
});

router.use("/mail", mailRouter);

export default router;
