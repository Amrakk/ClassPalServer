import express from "express";
import { api } from "../api/index.js";

const applicationRouter = express.Router();

applicationRouter.get("", api.application.getAll);
applicationRouter.get("/:id", api.application.getById);

applicationRouter.post("", api.application.insert);
applicationRouter.post("/register", api.application.register);

applicationRouter.patch("/:id", api.application.updateById);
applicationRouter.delete("/:id", api.application.deleteById);

export default applicationRouter;
