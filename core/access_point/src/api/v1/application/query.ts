import { z } from "zod";
import ApiController from "../../apiController.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";
import ApplicationService from "../../../services/internal/application.js";

import { ValidateError } from "mongooat";
import NotFoundError from "../../../errors/NotFoundError.js";

import type { IReqApplication } from "../../../interfaces/api/request.js";
import type { IResGetAll, IResGetById } from "../../../interfaces/api/response.js";

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

export const getAll = ApiController.callbackFactory<{}, { query: IReqApplication.GetAllQuery }, IResGetAll.Application>(
    async (req, res, next) => {
        try {
            const { query } = req;

            const validatedQuery = await querySchema.safeParseAsync(query);
            if (!validatedQuery.success)
                throw new ValidateError("Invalid query parameters", validatedQuery.error.errors);

            const [applications, totalDocuments] = await ApplicationService.getAll(validatedQuery.data);

            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
                data: { applications, totalDocuments },
            });
        } catch (err) {
            next(err);
        }
    }
);

export const getById = ApiController.callbackFactory<{ id: string }, {}, IResGetById.Application>(
    async (req, res, next) => {
        try {
            const { id } = req.params;

            const application = await ApplicationService.getById(id);
            if (!application) throw new NotFoundError("Application not found");

            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
                data: application,
            });
        } catch (err) {
            next(err);
        }
    }
);
