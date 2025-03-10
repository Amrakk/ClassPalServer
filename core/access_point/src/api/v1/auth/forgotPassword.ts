import redis from "../../../database/redis.js";
import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import CommunicationService from "../../../services/external/communication.js";

import BadRequestError from "../../../errors/BadRequestError.js";

import type { IReqAuth } from "../../../interfaces/api/request.js";

export const forgotPassword = ApiController.callbackFactory<{}, { body: IReqAuth.ForgotPassword }, {}>(
    async (req, res, next) => {
        try {
            const { email } = req.body;

            if (!email) throw new BadRequestError("Email is required");

            const cache = redis.getRedis();
            const otp = Math.floor(100000 + Math.random() * 900000);

            await CommunicationService.sendForgotOTP(email, otp);
            await cache.set(email, otp, "EX", 60 * 5);

            return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: {} });
        } catch (err) {
            next(err);
        }
    }
);
