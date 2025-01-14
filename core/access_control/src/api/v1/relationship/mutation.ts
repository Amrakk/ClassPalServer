import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import RelationshipService from "../../../services/internal/relationship.js";

import type { IReqRelationship } from "../../../interfaces/api/request.js";
import type { IRelationship } from "../../../interfaces/database/relationship.js";

export const bind = ApiController.callbackFactory<{}, { body: IReqRelationship.Bind }, {}>(async (req, res, next) => {
    try {
        const { body } = req;

        await RelationshipService.bind(body);
        return res.status(201).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS });
    } catch (err) {
        next(err);
    }
});

export const unbind = ApiController.callbackFactory<{}, { body: IReqRelationship.Unbind }, {}>(
    async (req, res, next) => {
        try {
            const { body } = req;

            await RelationshipService.unbind(body);
            return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS });
        } catch (err) {
            next(err);
        }
    }
);

export const upsert = ApiController.callbackFactory<
    {},
    { body: IReqRelationship.Upsert | IReqRelationship.Upsert[] },
    IRelationship[]
>(async (req, res, next) => {
    try {
        const { body } = req;
        let data = [];

        if (Array.isArray(body)) data = body;
        else data = [body];

        const relationships = await RelationshipService.upsert(data);
        return res
            .status(201)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: relationships });
    } catch (err) {
        next(err);
    }
});

export const updateByFromTo = ApiController.callbackFactory<
    {},
    { body: IReqRelationship.UpdateByFromTo },
    IRelationship[]
>(async (req, res, next) => {
    try {
        const { body } = req;

        const relationships = await RelationshipService.updateByFromTo(body);
        return res
            .status(200)
            .json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS, data: relationships });
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

export const deleteByFromToIds = ApiController.callbackFactory<{}, { body: IReqRelationship.DeleteByFromToIds }, {}>(
    async (req, res, next) => {
        try {
            const { ids } = req.body;

            await RelationshipService.deleteByFromToIds(ids);
            return res.status(200).json({ code: RESPONSE_CODE.SUCCESS, message: RESPONSE_MESSAGE.SUCCESS });
        } catch (err) {
            next(err);
        }
    }
);
