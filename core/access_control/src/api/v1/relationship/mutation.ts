import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import RelationshipService from "../../../services/internal/relationship.js";

import type { IReqRelationship } from "../../../interfaces/api/request.js";
import type { IRelationship } from "../../../interfaces/database/relationship.js";

export const insert = ApiController.callbackFactory<
    {},
    { body: IReqRelationship.Insert | IReqRelationship.Insert[] },
    IRelationship[]
>(async (req, res, next) => {
    try {
        const { body } = req;
        let data = [];

        if (Array.isArray(body)) data = body;
        else data = [body];

        const relationships = await RelationshipService.insert(data);
        return res
            .status(201)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: relationships });
    } catch (err) {
        next(err);
    }
});

export const updateById = ApiController.callbackFactory<
    { id: string },
    { body: IReqRelationship.Update },
    IRelationship
>(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const relationship = await RelationshipService.updateById(id, body);
        return res
            .status(200)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: relationship });
    } catch (err) {
        next(err);
    }
});

export const deleteById = ApiController.callbackFactory<{ id: string }, {}, IRelationship>(async (req, res, next) => {
    try {
        const { id } = req.params;

        const relationship = await RelationshipService.deleteById(id);
        return res
            .status(200)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: relationship });
    } catch (err) {
        next(err);
    }
});

export const deleteByFrom = ApiController.callbackFactory<{ from: string }, {}, {}>(async (req, res, next) => {
    try {
        const { from } = req.params;

        await RelationshipService.deleteByFrom(from);
        return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS });
    } catch (err) {
        next(err);
    }
});

export const deleteByTo = ApiController.callbackFactory<{ to: string }, {}, {}>(async (req, res, next) => {
    try {
        const { to } = req.params;

        await RelationshipService.deleteByTo(to);
        return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS });
    } catch (err) {
        next(err);
    }
});
