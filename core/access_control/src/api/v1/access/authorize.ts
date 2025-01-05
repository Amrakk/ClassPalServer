import ApiController from "../../apiController.js";
import ForbiddenError from "../../../errors/ForbiddenError.js";
import AccessService from "../../../services/internal/access.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IReqAccess } from "../../../interfaces/api/request.js";

export const authorize = ApiController.callbackFactory<{}, { body: IReqAccess.Authorize }, {}>(
    async (req, res, next) => {
        try {
            const isAuthorized = await AccessService.authorize(req.body);

            if (!isAuthorized) throw new ForbiddenError();
            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
            });
        } catch (err) {
            next(err);
        }
    }
);
