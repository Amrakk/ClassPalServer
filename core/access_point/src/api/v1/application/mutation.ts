import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import ApplicationService from "../../../services/internal/application.js";

import type { IReqApplication } from "../../../interfaces/api/request.js";
import type { IApplication } from "../../../interfaces/database/application.js";

export const insert = ApiController.callbackFactory<
    {},
    { body: IReqApplication.Insert | IReqApplication.Insert[] },
    IApplication[]
>(async (req, res, next) => {
    try {
        const { body } = req;
        let data = [];

        if (Array.isArray(body)) data = body;
        else data = [body];

        const applications = await ApplicationService.insert(data);

        return res
            .status(201)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: applications });
    } catch (err) {
        next(err);
    }
});

export const updateById = ApiController.callbackFactory<{ id: string }, { body: IReqApplication.Update }, IApplication>(
    async (req, res, next) => {
        try {
            const { id } = req.params;
            const { body } = req;

            const application = await ApplicationService.updateById(id, body);
            return res
                .status(200)
                .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: application });
        } catch (err) {
            next(err);
        }
    }
);

export const deleteById = ApiController.callbackFactory<{ id: string }, {}, IApplication>(async (req, res, next) => {
    try {
        const { id } = req.params;

        const application = await ApplicationService.deleteById(id);

        return res
            .status(200)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: application });
    } catch (err) {
        next(err);
    }
});
