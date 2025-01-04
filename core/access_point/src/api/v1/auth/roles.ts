import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import AccessControlService from "../../../services/external/accessControl.js";

import type { IRoleSimplified } from "../../../interfaces/services/external/accessControl.js";

export const getRoles = ApiController.callbackFactory<{}, {}, IRoleSimplified[]>(async (req, res, next) => {
    try {
        const roles = await AccessControlService.getRoles();

        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: roles,
        });
    } catch (err) {
        next(err);
    }
});
