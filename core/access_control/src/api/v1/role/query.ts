import { z } from "zod";
import ApiController from "../../apiController.js";
import RoleService from "../../../services/internal/role.js";
import PolicyService from "../../../services/internal/policy.js";
import { RESPONSE_CODE, RESPONSE_MESSAGE } from "../../../constants.js";

import { ObjectId, ValidateError } from "mongooat";
import NotFoundError from "../../../errors/NotFoundError.js";

import type { IReqRole } from "../../../interfaces/api/request.js";
import type { IPolicy } from "../../../interfaces/database/policy.js";
import type { IResGetAll, IResGetById } from "../../../interfaces/api/response.js";
import type { IRelationGroups, IRole } from "../../../interfaces/database/role.js";

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

export const getAll = ApiController.callbackFactory<{}, { query: IReqRole.GetAllQuery }, IResGetAll.Role>(
    async (req, res, next) => {
        try {
            const { query } = req;

            const validatedQuery = await querySchema.safeParseAsync(query);
            if (!validatedQuery.success)
                throw new ValidateError("Invalid query parameters", validatedQuery.error.errors);

            const [roles, totalDocuments] = await RoleService.getAll(validatedQuery.data);

            return res.status(200).json({
                code: RESPONSE_CODE.SUCCESS,
                message: RESPONSE_MESSAGE.SUCCESS,
                data: { roles, totalDocuments },
            });
        } catch (err) {
            next(err);
        }
    }
);

export const getById = ApiController.callbackFactory<{ id: string }, {}, IResGetById.Role>(async (req, res, next) => {
    try {
        const { id } = req.params;

        const role = await RoleService.getById(id);
        if (!role) throw new NotFoundError("Role not found");

        const parentIds = [...role.parents.mandatory, ...role.parents.optional];
        const privilegeIds = [...role.privileges.mandatory, ...role.privileges.optional];

        let [parents, privileges, children] = await Promise.all([
            parentIds.length > 0 ? RoleService.getById(parentIds) : ([] as IRole[]),
            privilegeIds.length > 0 ? PolicyService.getById(privilegeIds) : ([] as IPolicy[]),
            RoleService.getChildren(id),
        ]);

        return res.status(200).json({
            code: RESPONSE_CODE.SUCCESS,
            message: RESPONSE_MESSAGE.SUCCESS,
            data: {
                ...role,
                parents: filterRelations(
                    parents.map(({ _id, name, isLocked }) => ({ _id, name, isLocked })),
                    role.parents
                ),
                privileges: filterRelations(privileges, role.privileges),
                children,
            },
        });
    } catch (err) {
        next(err);
    }
});

function filterRelations<T extends { _id: ObjectId | string }>(
    items: T[],
    groupIds: { mandatory: (ObjectId | string)[]; optional: (ObjectId | string)[] }
): IRelationGroups<T> {
    return {
        mandatory: items.filter((item) => groupIds.mandatory.map((id) => id.toString()).includes(item._id.toString())),
        optional: items.filter((item) => groupIds.optional.map((id) => id.toString()).includes(item._id.toString())),
    };
}
