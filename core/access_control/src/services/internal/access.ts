import RoleService from "./role.js";
import PolicyService from "./policy.js";
import { ENV } from "../../constants.js";
import mongooat from "../../database/db.js";
import RelationshipService from "./relationship.js";
import { ObjectId, ValidateError, z } from "mongooat";
import { getAllPrivileges, nodeSchema } from "../../utils/nodeSchema.js";

import ServiceResponseError from "../../errors/ServiceResponseError.js";

import type { IReqAccess } from "../../interfaces/api/request.js";
import type { IRole, IRoleSimplified } from "../../interfaces/database/role.js";

const isDev = ENV === "development";

export default class AccessService {
    private static registerSchema = z.object({
        roles: z.array(nodeSchema),
    });

    public static async register(data: IReqAccess.Register): Promise<IRoleSimplified[]> {
        const result = await this.registerSchema.safeParseAsync(data);
        if (!result.success) throw new ValidateError("Invalid data", result.error.errors);

        const session = mongooat.getBase().startSession();

        const { roles: inputRoles } = result.data;
        const returnRoles: IRoleSimplified[] = [];

        try {
            await session.withTransaction(async () => {
                const allPrivileges = getAllPrivileges(inputRoles);
                const privileges = await (isDev
                    ? PolicyService.upsert(allPrivileges, { session })
                    : PolicyService.insert(allPrivileges, { session }));

                async function insertRoles(nodes: IReqAccess.Node[], parentId?: ObjectId) {
                    for (const node of nodes) {
                        const role: Omit<IRole, "_id"> = {
                            name: node.role.name,
                            isLocked: true,
                            privileges: {
                                mandatory: [],
                                optional: [],
                            },
                            parents: {
                                mandatory: parentId ? [parentId] : [],
                                optional: [],
                            },
                        };

                        for (const privilege of node.role.privileges) {
                            const privilegeId = privileges.find(
                                (p) =>
                                    `${p.action}_${p.relationship}` === `${privilege.action}_${privilege.relationship}`
                            )?._id;
                            if (!privilegeId)
                                throw new ServiceResponseError(
                                    "Access Control",
                                    "Role, Policy registration failed",
                                    "Something went wrong while mapping privileges",
                                    { privilege }
                                );
                            role.privileges.mandatory.push(privilegeId);
                        }

                        const [insertedRole] = await (isDev
                            ? RoleService.upsert([role], { session })
                            : RoleService.insert([role], { session }));

                        returnRoles.push({
                            _id: insertedRole._id,
                            name: insertedRole.name,
                            isLocked: insertedRole.isLocked,
                        });

                        if (node.child.length > 0) {
                            await insertRoles(node.child, insertedRole._id);
                        }
                    }
                }

                await insertRoles(inputRoles);
            });

            return returnRoles;
        } catch (err) {
            throw err;
        } finally {
            session.endSession();
        }
    }

    public static async authorize(data: IReqAccess.Authorize): Promise<boolean> {
        const { fromId, fromRoleIds, toId, action } = data;

        const [fromRoles, policies] = await Promise.all([
            RoleService.getById(fromRoleIds),
            PolicyService.getByAction(action),
        ]);
        if (!fromRoles.length || !policies.length) return false;

        const fromPrivilegeIds = await RoleService.getAllPrivileges(fromRoleIds);
        const validPolicies = policies.filter((policy) =>
            fromPrivilegeIds.some((privilege) => `${privilege}` === `${policy._id}`)
        );
        if (!validPolicies.length) return false;

        const relationships = await RelationshipService.getByFromTo(fromId, toId);
        for (const policy of validPolicies) {
            const hasValidRelationship = relationships.some((rel) => rel.relationship === policy.relationship);
            if (hasValidRelationship) return true;
        }

        return false;
    }
}
