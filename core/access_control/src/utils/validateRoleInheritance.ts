import type { ObjectId } from "mongooat";
import type { IRelationGroups, IRole } from "../interfaces/database/role.js";

function hasCycle(
    roleId: ObjectId,
    relations: IRelationGroups,
    allRoles: IRole[],
    visited = new Set<ObjectId>()
): boolean {
    if (visited.has(roleId)) return true;

    visited.add(roleId);
    const parentIds = relations.mandatory.concat(relations.optional);

    for (const parentId of parentIds) {
        const parentRole = allRoles.find((role) => `${role._id}` === `${parentId}`);
        if (parentRole && hasCycle(parentId, parentRole.parents, allRoles, visited)) return true;
    }

    visited.delete(roleId);
    return false;
}

export function validateRoleInheritance(role: IRole, allRoles: IRole[]): boolean {
    const parentIds = role.parents.mandatory.concat(role.parents.optional);
    if (parentIds.some((parentId) => `${role._id}` === `${parentId}`)) return false;

    return !hasCycle(role._id, role.parents, allRoles);
}
