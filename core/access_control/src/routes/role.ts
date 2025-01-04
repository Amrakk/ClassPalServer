import express from "express";
import { api } from "../api/index.js";

const roleRouter = express.Router();

roleRouter.get("", api.role.getAll);
roleRouter.get("/:id", api.role.getById);

roleRouter.post("", api.role.insert);
roleRouter.patch("/:id", api.role.updateById);
roleRouter.delete("/:id", api.role.deleteById);

export default roleRouter;
