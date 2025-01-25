import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import { setAccToken, setRefToken } from "../../../utils/tokenHandlers.js";

import type { IResLogin } from "../../../interfaces/api/response.js";
import ServiceResponseError from "../../../errors/ServiceResponseError.js";

export const verify = ApiController.callbackFactory<{}, {}, IResLogin>(async (req, res, next) => {
    try {
        const { user } = req.ctx;

        if (!user)
            throw new ServiceResponseError(
                "AccessPointService",
                "verify",
                "User is not being assigned to the ctx object after the verify middleware runs",
                { headers: req.headers }
            );

        await Promise.all([setAccToken(user._id, res), setRefToken(user._id, res)]);

        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: { user },
        });
    } catch (err) {
        next(err);
    }
});
