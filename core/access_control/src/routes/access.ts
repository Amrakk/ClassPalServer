import express from "express";
import { api } from "../api/index.js";

const accessRouter = express.Router();

accessRouter.post("/register", api.access.register);
accessRouter.post("/authorize", api.access.authorize);

export default accessRouter;
