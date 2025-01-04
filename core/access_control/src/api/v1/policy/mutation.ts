import ApiController from "../../apiController.js";
import PolicyService from "../../../services/internal/policy.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IReqPolicy } from "../../../interfaces/api/request.js";
import type { IPolicy } from "../../../interfaces/database/policy.js";

export const insert = ApiController.callbackFactory<{}, { body: IReqPolicy.Insert | IReqPolicy.Insert[] }, IPolicy[]>(
    async (req, res, next) => {
        try {
            const { body } = req;
            let data = [];

            if (Array.isArray(body)) data = body;
            else data = [body];

            const policies = await PolicyService.insert(data);
            return res
                .status(201)
                .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: policies });
        } catch (err) {
            next(err);
        }
    }
);

export const updateById = ApiController.callbackFactory<{ id: string }, { body: IReqPolicy.Update }, IPolicy>(
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { body } = req;

            const policy = await PolicyService.updateById(id, body);
            return res
                .status(200)
                .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: policy });
        } catch (err) {
            next(err);
        }
    }
);

export const deleteById = ApiController.callbackFactory<{ id: string }, {}, IPolicy>(async (req, res, next) => {
    try {
        const { id } = req.params;

        const policy = await PolicyService.deleteById(id);
        return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: policy });
    } catch (err) {
        next(err);
    }
});
