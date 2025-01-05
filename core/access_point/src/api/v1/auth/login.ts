import ApiController from "../../apiController.js";
import UserService from "../../../services/internal/user.js";
import { setAccToken, setRefToken } from "../../../utils/tokenHandlers.js";
import { googleRedirect } from "../../../middlewares/googleAuthentication.js";
import { CLIENT_URL, RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import type { IUser } from "../../../interfaces/database/user.js";
import type { IReqAuth } from "../../../interfaces/api/request.js";
import type { IResLogin } from "../../../interfaces/api/response.js";

export const login = ApiController.callbackFactory<{}, { body: IReqAuth.Login }, IResLogin>(async (req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;

        const user = await UserService.login(emailOrPhone, password);

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

export const google = ApiController.callbackFactory<{}, {}, {}>(async (req, res, next) => {
    try {
        return googleRedirect(req, res, next);
    } catch (err) {
        next(err);
    }
});

export const googleCallback = ApiController.callbackFactory<{}, {}, IResLogin>(async (req, res, next) => {
    try {
        const user = req.user as IUser;

        await Promise.all([setAccToken(user._id, res), setRefToken(user._id, res)]);

        return res.redirect(`${CLIENT_URL}/home`);
    } catch (err) {
        next(err);
    }
});
