import express from "express";
import roleRouter from "./role.js";
import policyRouter from "./policy.js";
import relationshipRouter from "./relationship.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("API is working");
});

router.use("/roles", roleRouter);
router.use("/policies", policyRouter);
router.use("/relationships", relationshipRouter);

export default router;
