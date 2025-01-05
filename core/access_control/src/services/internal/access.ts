import RoleService from "./role.js";
import PolicyService from "./policy.js";
import mongooat from "../../database/db.js";
import RelationshipService from "./relationship.js";

import type { IReqAccess } from "../../interfaces/api/request.js";

export default class AccessService {
    public static async register(data: IReqAccess.Register): Promise<void> {
        const session = mongooat.getBase().startSession();

        try {
            await Promise.all([
                data.roles && data.roles.length > 0 ? RoleService.insert(data.roles, { session }) : null,
                data.policies && data.policies.length > 0 ? PolicyService.insert(data.policies, { session }) : null,
            ]);
        } catch (err) {
            await session.abortTransaction();
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
