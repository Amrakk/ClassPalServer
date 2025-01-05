import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import RelationshipService from "../../../services/internal/relationship.js";

import NotFoundError from "../../../errors/NotFoundError.js";

import type { IRelationship } from "../../../interfaces/database/relationship.js";

export const getById = ApiController.callbackFactory<{ id: string }, {}, IRelationship>(async (req, res, next) => {
    try {
        const { id } = req.params;

        const relationships = await RelationshipService.getById(id);
        if (!relationships) throw new NotFoundError("Relationship not found");

        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: relationships,
        });
    } catch (err) {
        next(err);
    }
});

export const getByFrom = ApiController.callbackFactory<{ from: string }, {}, IRelationship[]>(
    async (req, res, next) => {
        try {
            const { from } = req.params;

            const relationships = await RelationshipService.getByFrom(from);
            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
                data: relationships,
            });
        } catch (err) {
            next(err);
        }
    }
);

export const getByTo = ApiController.callbackFactory<{ to: string }, {}, IRelationship[]>(async (req, res, next) => {
    try {
        const { to } = req.params;

        const relationships = await RelationshipService.getByTo(to);
        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: relationships,
        });
    } catch (err) {
        next(err);
    }
});
