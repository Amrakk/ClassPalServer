import { z } from "zod";
import ApiController from "../../apiController.js";
import PolicyService from "../../../services/internal/policy.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import { ValidateError } from "mongooat";

import type { IReqPolicy } from "../../../interfaces/api/request.js";
import type { IResGetAll } from "../../../interfaces/api/response.js";
import type { IPolicy } from "../../../interfaces/database/policy.js";

const querySchema = z
    .object({
        page: z.coerce.number().int().positive().optional(),
        limit: z.coerce.number().int().positive().optional(),

        searchTerm: z.string().optional(),
    })
    .strict()
    .refine(
        (data) => {
            if (!data.limit && data.page) return false;
            return true;
        },
        { message: "'limit' must be provided if 'page' is provided", path: ["limit"] }
    );

export const getAll = ApiController.callbackFactory<{}, { query: IReqPolicy.GetAllQuery }, IResGetAll.Policy>(
    async (req, res, next) => {
        try {
            const { query } = req;

            const validatedQuery = await querySchema.safeParseAsync(query);
            if (!validatedQuery.success)
                throw new ValidateError("Invalid query parameters", validatedQuery.error.errors);

            const [policies, totalDocuments] = await PolicyService.getAll(validatedQuery.data);

            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
                data: { policies, totalDocuments },
            });
        } catch (err) {
            next(err);
        }
    }
);

export const getByAction = ApiController.callbackFactory<{ action: string }, {}, IPolicy[]>(async (req, res, next) => {
    try {
        const { action } = req.params;

        const policies = await PolicyService.getByAction(action);

        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: policies,
        });
    } catch (err) {
        next(err);
    }
});
