import ApiController from "../../apiController.js";
import RoleService from "../../../services/internal/role.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IRole } from "../../../interfaces/database/role.js";
import type { IReqRole } from "../../../interfaces/api/request.js";

export const insert = ApiController.callbackFactory<{}, { body: IReqRole.Insert | IReqRole.Insert[] }, IRole[]>(
    async (req, res, next) => {
        try {
            const { body } = req;
            let data = [];

            if (Array.isArray(body)) data = body;
            else data = [body];

            const roles = await RoleService.insert(data);

            return res
                .status(201)
                .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: roles });
        } catch (err) {
            next(err);
        }
    }
);

export const updateById = ApiController.callbackFactory<{ id: string }, { body: IReqRole.PreprocessUpdate }, IRole>(
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { body } = req;

            const role = await RoleService.updateById(id, body);
            return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: role });
        } catch (err) {
            next(err);
        }
    }
);

export const deleteById = ApiController.callbackFactory<{ id: string }, {}, IRole>(async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await RoleService.deleteById(id);

        return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: role });
    } catch (err) {
        next(err);
    }
});
