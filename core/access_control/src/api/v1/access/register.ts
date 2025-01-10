import ApiController from "../../apiController.js";
import AccessService from "../../../services/internal/access.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IReqAccess } from "../../../interfaces/api/request.js";
import type { IRoleSimplified } from "../../../interfaces/database/role.js";

export const register = ApiController.callbackFactory<{}, { body: IReqAccess.Register }, IRoleSimplified[]>(
    async (req, res, next) => {
        try {
            const roles = await AccessService.register(req.body);

            return res.status(201).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
                data: roles,
            });
        } catch (err) {
            next(err);
        }
    }
);
