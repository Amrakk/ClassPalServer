import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import ApplicationService from "../../../services/internal/application.js";

import type { IReqApplication } from "../../../interfaces/api/request.js";
import type { IApplication } from "../../../interfaces/database/application.js";

// TODO: implement role, policy register
export const register = ApiController.callbackFactory<{}, { body: IReqApplication.Register }, IApplication>(
    async (req, res, next) => {
        try {
            const { body } = req;

            let application = await ApplicationService.getByName(body.name);
            console.log(JSON.stringify(application, undefined, 2));
            if (application) await ApplicationService.updateById(application._id, body);
            else application = (await ApplicationService.insert([body]))[0];

            return res
                .status(201)
                .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: application });
        } catch (err) {
            next(err);
        }
    }
);
