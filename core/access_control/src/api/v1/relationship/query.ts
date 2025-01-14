import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import RelationshipService from "../../../services/internal/relationship.js";

import { ValidateError, z } from "mongooat";
import NotFoundError from "../../../errors/NotFoundError.js";

import type { IReqRelationship } from "../../../interfaces/api/request.js";
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

const querySchema = z
    .object({
        relationships: z.preprocess((val) => (val ? [val].flat() : val), z.array(z.string())),
    })
    .optional();

export const getByFrom = ApiController.callbackFactory<
    { from: string },
    { query: IReqRelationship.Query },
    IRelationship[]
>(async (req, res, next) => {
    try {
        const { from } = req.params;

        const result = await querySchema.safeParseAsync(req.query);
        if (result.error) throw new ValidateError("Invalid query", result.error.errors);

        const relationships = await RelationshipService.getByFrom(from, result.data);
        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: relationships,
        });
    } catch (err) {
        next(err);
    }
});

export const getByTo = ApiController.callbackFactory<
    { to: string },
    { query: IReqRelationship.Query },
    IRelationship[]
>(async (req, res, next) => {
    try {
        const { to } = req.params;

        const result = await querySchema.safeParseAsync(req.query);
        if (result.error) throw new ValidateError("Invalid query", result.error.errors);

        const relationships = await RelationshipService.getByTo(to, result.data);
        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: relationships,
        });
    } catch (err) {
        next(err);
    }
});
