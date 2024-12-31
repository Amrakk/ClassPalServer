import express from "express";
import authRouter from "./authRouter.js";
import userRouter from "./userRouter.js";
import applicationRouter from "./applicationRouter.js";
import gatewayRouter from "./gatewayRouter.js";

const router = express.Router();

router.use(express.json());
router.get("/", (req, res) => {
    res.send("API is working");
});

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/applications", applicationRouter);

export default router;
