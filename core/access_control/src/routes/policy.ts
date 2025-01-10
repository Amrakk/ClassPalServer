import express from "express";
import { api } from "../api/index.js";

const policyRouter = express.Router();

policyRouter.get("/", api.policy.getAll);
policyRouter.get("/:action", api.policy.getByAction);

policyRouter.post("/", api.policy.insert);
policyRouter.patch("/:id", api.policy.updateById);
policyRouter.delete("/:id", api.policy.deleteById);

export default policyRouter;
