import ApiController from "../../apiController.js";
import AccessService from "../../../services/internal/access.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IReqAccess } from "../../../interfaces/api/request.js";

export const register = ApiController.callbackFactory<{}, { body: IReqAccess.Register }, {}>(async (req, res, next) => {
    try {
        await AccessService.register(req.body);

        return res.status(201).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
        });
    } catch (err) {
        next(err);
    }
});
