import express from "express";
import { api } from "../api/index.js";

const relationshipRouter = express.Router();

relationshipRouter.post("/bind", api.relationship.bind);
relationshipRouter.delete("/unbind", api.relationship.unbind);

relationshipRouter.get("/:id", api.relationship.getById);
relationshipRouter.get("/to/:to", api.relationship.getByTo);
relationshipRouter.get("/from/:from", api.relationship.getByFrom);

relationshipRouter.post("/", api.relationship.upsert);
relationshipRouter.patch("/", api.relationship.updateByFromTo);

relationshipRouter.delete("/", api.relationship.deleteByFromToIds);
relationshipRouter.delete("/:id", api.relationship.deleteById);
relationshipRouter.delete("/to/:to", api.relationship.deleteByTo);
relationshipRouter.delete("/from/:from", api.relationship.deleteByFrom);

export default relationshipRouter;
