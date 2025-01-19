import express from "express";
import { api } from "../api/index.js";

const mailRouter = express.Router();

mailRouter.post("/send-forgot-otp", api.mail.sendForgotOTP);
mailRouter.post("/send-invitation", api.mail.sendInvitation);

export default mailRouter;
