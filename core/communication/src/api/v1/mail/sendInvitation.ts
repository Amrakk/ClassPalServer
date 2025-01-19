import { z } from "mongooat";
import ApiController from "../../apiController.js";
import MailService from "../../../services/internal/mail.js";
import { MAX_EMAILS_PER_DAY, MAX_EMAILS_PER_REQUEST, RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import BadRequestError from "../../../errors/BadRequestError.js";

import type { IReqMail } from "../../../interfaces/api/request.js";
import redis from "../../../database/redis.js";
import { error } from "console";

const recipientSchema = z.object({
    name: z.string(),
    role: z.string(),
    navigateUrl: z.string(),
    email: z.string().email(),
    expiredAt: z.preprocess((val) => (typeof val === "string" ? new Date(Date.parse(val)) : val), z.date()),
});

const requestSchema = z.object({
    recipients: z.array(recipientSchema),
    senderName: z.string(),
    groupName: z.string(),
    groupType: z.string(),
});

export const sendInvitation = ApiController.callbackFactory<{}, { body: IReqMail.SendInvitation }, {}>(
    async (req, res, next) => {
        try {
            const { "x-user-id": userId } = req.headers;

            if (!userId) throw new BadRequestError("Missing user id in header");

            const cache = redis.getRedis();
            const key = `sendInvitation:${userId}`;
            const value = await cache.get(key);

            if (parseInt(`${value ?? 0}`) > MAX_EMAILS_PER_DAY)
                throw new BadRequestError("Exceeded maximum emails per day");

            const result = await requestSchema.safeParseAsync(req.body);
            if (result.error) throw new BadRequestError("Invalid request body", { error: result.error.errors });

            if (result.data.recipients.length > MAX_EMAILS_PER_REQUEST)
                throw new BadRequestError("Exceeded maximum recipients per request");

            await Promise.all([
                MailService.sendInvitation(result.data),
                cache.set(key, `${parseInt(`${value ?? 0}`) + result.data.recipients.length}`, "EX", 86400),
            ]);

            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
            });
        } catch (err) {
            next(err);
        }
    }
);
