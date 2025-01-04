import PolicyService from "./policy.js";
import { z, ZodObjectId } from "mongooat";
import redis from "../../database/redis.js";
import { isIdsExist } from "../../utils/isIdExist.js";
import { roleModel } from "../../database/models/role.js";
import { removeUndefinedKeys } from "../../utils/removeUndefinedKeys.js";
import { getUniqueArray, isDuplicate } from "../../utils/arrayHandlers.js";
import { validateRoleInheritance } from "../../utils/validateRoleInheritance.js";

import NotFoundError from "../../errors/NotFoundError.js";
import BadRequestError from "../../errors/BadRequestError.js";

import type { ObjectId } from "mongooat";
import type { IOffsetPagination, IReqRole } from "../../interfaces/api/request.js";
import type { IRelationGroups, IRole, IRoleSimplified } from "../../interfaces/database/role.js";

export default class RoleService {
    private static cacheKey = "roles";

    public static async init() {
        const cache = redis.getRedis();
        const roles = await roleModel.find();
        await cache.set(this.cacheKey, JSON.stringify(roles), "EX", 60 * 60 * 24);
    }

    public static async isRoleExists(id: ObjectId): Promise<boolean>;
    public static async isRoleExists(ids: ObjectId[]): Promise<boolean>;
    public static async isRoleExists(ids: ObjectId | ObjectId[]): Promise<boolean> {
        return isIdsExist(roleModel, Array.isArray(ids) ? ids : [ids]);
    }

    private static async getCachedRoles(): Promise<IRole[] | null> {
        const cache = redis.getRedis();
        const roles = JSON.parse((await cache.get(this.cacheKey)) ?? "null") as IRole[] | null;
        return roles;
    }

    private static async updateCache(roles: IRole[]): Promise<void> {
        const cache = redis.getRedis();
        await cache.set(this.cacheKey, JSON.stringify(roles), "EX", 60 * 60 * 24);
    }

    private static async validateInsertData(data: IReqRole.Insert[]): Promise<void> {
        await Promise.all(
            data.map(async (role) => {
                await this.validatePrivileges(role.privileges);
                await this.validateParents(role.parents);
            })
        );
    }

    private static async validatePrivileges(privileges?: IRelationGroups<string | ObjectId>): Promise<void> {
        if (!privileges) return;

        privileges.mandatory = getUniqueArray(privileges.mandatory);
        privileges.optional = getUniqueArray(privileges.optional);

        const allPrivileges = [...privileges.mandatory, ...privileges.optional];
        if (isDuplicate(allPrivileges)) throw new BadRequestError("Duplicate privileges");

        const parsedPrivileges = z.array(ZodObjectId).safeParse(allPrivileges);
        if (parsedPrivileges.error) throw new BadRequestError("Invalid privileges");

        if (!(await PolicyService.isPolicyExists(parsedPrivileges.data))) throw new BadRequestError("Policy not found");
    }

    private static async validateParents(parents?: IRelationGroups<string | ObjectId>): Promise<void> {
        if (!parents) return;

        parents.mandatory = getUniqueArray(parents.mandatory);
        parents.optional = getUniqueArray(parents.optional);

        const allParents = [...parents.mandatory, ...parents.optional];
        if (isDuplicate(allParents)) throw new BadRequestError("Duplicate parents");

        const parsedParents = z.array(ZodObjectId).safeParse(allParents);
        if (parsedParents.error) throw new BadRequestError("Invalid parents");

        if (!(await this.isRoleExists(parsedParents.data))) throw new BadRequestError("Parents not found");
    }

    // Query
    public static async getAll(
        query: IReqRole.Filter & IOffsetPagination,
        noCache?: boolean
    ): Promise<[IRole[], number]> {
        const { page, limit, searchTerm } = query;
        const skip = ((page ?? 1) - 1) * (limit ?? 0);

        if (!page && !limit && !searchTerm && !noCache) {
            const cachedRoles = await this.getCachedRoles();
            if (cachedRoles) return [cachedRoles, cachedRoles.length];
        }

        const filter = {
            $or: searchTerm ? [{ name: { $regex: searchTerm, $options: "i" } }] : undefined,
        };

        const cleanedFilter = removeUndefinedKeys(filter);

        const [roles, totalDocuments] = await Promise.all([
            roleModel.collection
                .find(cleanedFilter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit ?? 0)
                .toArray(),
            roleModel.countDocuments(cleanedFilter),
        ]);

        if (!page && !limit && !searchTerm) await this.updateCache(roles);

        return [roles, totalDocuments];
    }

    // TODO: reimplement this
    public static async getById(id: string | ObjectId): Promise<IRole | null>;
    public static async getById(ids: (string | ObjectId)[]): Promise<IRole[]>;
    public static async getById(ids: string | ObjectId | (string | ObjectId)[]): Promise<IRole[] | IRole | null> {
        if (Array.isArray(ids)) {
            const result = await z.array(ZodObjectId).safeParseAsync(ids);
            if (result.error) throw new NotFoundError("Roles not found");

            return roleModel.find({ _id: { $in: result.data } });
        }

        const result = await ZodObjectId.safeParseAsync(ids);
        if (result.error) throw new NotFoundError("Role not found");

        return roleModel.findById(result.data);
    }

    public static async getChildren(id: string | ObjectId): Promise<IRoleSimplified[]> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Role not found");

        const pipeline = [
            {
                $match: {
                    $or: [{ "parents.mandatory": result.data }, { "parents.optional": result.data }],
                },
            },
            { $project: { _id: 1, name: 1, isLocked: 1 } },
        ];

        return roleModel.aggregate(pipeline).toArray();
    }

    // Mutation
    public static async insert(data: IReqRole.Insert[]): Promise<IRole[]> {
        await this.validateInsertData(data);
        const roles = await roleModel.insertMany(data);

        const cachedRoles = await this.getCachedRoles();
        if (cachedRoles) await this.updateCache([...cachedRoles, ...roles]);

        return roles;
    }

    public static async updateById(id: string | ObjectId, data: IReqRole.PreprocessUpdate): Promise<IRole> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Role not found");

        const cachedRoles = (await this.getCachedRoles()) ?? (await roleModel.find());
        const role = cachedRoles.find((r) => `${r._id}` === `${result.data}` && !r.isLocked);
        if (!role) throw new NotFoundError("Role not found or is locked");

        const updateData = await this.prepareUpdateData(role, data);
        const updatedRole = await roleModel.findOneAndUpdate({ _id: result.data, isLocked: false }, updateData, {
            returnDocument: "after",
        });

        if (!updatedRole) throw new NotFoundError("Role not found or is locked");
        const updatedRoles = cachedRoles.map((r) => (r._id === updatedRole._id ? updatedRole : r));
        await this.updateCache(updatedRoles);

        return updatedRole;
    }

    private static async prepareUpdateData(role: IRole, data: IReqRole.PreprocessUpdate): Promise<IReqRole.Update> {
        const dataSchema = z.object({
            name: z.string().optional(),
            isLocked: z.boolean().optional(),
            optionalPrivileges: z.array(ZodObjectId).optional(),
            optionalParents: z.array(ZodObjectId).optional(),
        });
        const result = await dataSchema.safeParseAsync(data);
        if (result.error) throw new BadRequestError("Invalid data", { errors: result.error.errors });

        let { optionalParents, optionalPrivileges, ...rest } = result.data;
        const updateData: IReqRole.Update = { ...rest };

        if (optionalPrivileges) {
            optionalPrivileges = getUniqueArray(optionalPrivileges);
            if (!(await PolicyService.isPolicyExists(optionalPrivileges)))
                throw new BadRequestError("Policy not found");
            updateData.privileges = {
                ...role.privileges,
                optional: optionalPrivileges.filter((id) => !role.privileges.mandatory.includes(id)),
            };
        }

        if (optionalParents) {
            optionalParents = getUniqueArray(optionalParents);
            if (!(await this.isRoleExists(optionalParents))) throw new BadRequestError("Parents not found");
            if (
                !validateRoleInheritance(
                    { ...role, parents: { ...role.parents, optional: optionalParents } },
                    await roleModel.find()
                )
            )
                throw new BadRequestError("Parent role creates a cycle");

            updateData.parents = {
                ...role.parents,
                optional: optionalParents.filter((id) => !role.parents.mandatory.includes(id)),
            };
        }

        return updateData;
    }

    public static async deleteById(id: string | ObjectId): Promise<IRole> {
        const result = await ZodObjectId.safeParseAsync(id);
        if (result.error) throw new NotFoundError("Role not found");

        const children = await this.getChildren(id);
        if (children.length > 0) throw new BadRequestError("Role has children", { children });

        const deletedRole = await roleModel.findOneAndDelete({ _id: result.data, isLocked: false });
        if (!deletedRole) throw new NotFoundError("Role not found or is locked");

        const cachedRoles = (await this.getCachedRoles()) ?? (await roleModel.find());
        const updatedRoles = cachedRoles.filter((r) => `${r._id}` !== `${deletedRole._id}`);
        await this.updateCache(updatedRoles);

        return deletedRole;
    }
}
