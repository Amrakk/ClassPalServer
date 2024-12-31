import express from "express";
import { api } from "../api/index.js";

const mailRouter = express.Router();

mailRouter.post("/send-forgot-otp", api.mail.sendForgotOTP);

export default mailRouter;
