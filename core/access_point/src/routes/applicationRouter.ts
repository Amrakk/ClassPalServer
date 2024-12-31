import express from "express";
import { api } from "../api/index.js";

const applicationRouter = express.Router();

applicationRouter.get("/:id", api.application.getById);
applicationRouter.patch("/:id", api.application.updateById);
applicationRouter.delete("/:id", api.application.deleteById);

applicationRouter.get("", api.application.getAll);
applicationRouter.post("", api.application.insert);
applicationRouter.post("/register", api.application.register);

export default applicationRouter;
