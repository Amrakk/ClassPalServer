import ApiController from "../../apiController.js";
import MailService from "../../../services/internal/mail.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IReqMail } from "../../../interfaces/api/request.js";
import BadRequestError from "../../../errors/BadRequestError.js";

export const sendForgotOTP = ApiController.callbackFactory<{}, { body: IReqMail.SendForgotOTP }, {}>(
    async (req, res, next) => {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) throw new BadRequestError("Email and OTP are required");

            await MailService.sendForgotOTP(email, otp);

            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
            });
        } catch (err) {
            next(err);
        }
    }
);
