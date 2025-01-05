import express from "express";
import { api } from "../api/index.js";
import { USER_ROLE } from "../constants.js";
import { verify } from "../middlewares/verify.js";

const applicationRouter = express.Router();

applicationRouter.post("/register", api.application.register);

applicationRouter.get("", verify([USER_ROLE.ADMIN]), api.application.getAll);
applicationRouter.get("/:id", verify([USER_ROLE.ADMIN]), api.application.getById);

applicationRouter.post("", verify([USER_ROLE.ADMIN]), api.application.insert);
applicationRouter.patch("/:id", verify([USER_ROLE.ADMIN]), api.application.updateById);
applicationRouter.delete("/:id", verify([USER_ROLE.ADMIN]), api.application.deleteById);

export default applicationRouter;
