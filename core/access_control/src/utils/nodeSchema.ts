import { z } from "mongooat";

import type { IReqAccess } from "../interfaces/api/request.js";
import type { IPolicy } from "../interfaces/database/policy.js";

type Node = z.infer<typeof baseNodeSchema> & {
    child: Node[];
};

const baseNodeSchema = z.object({
    role: z.object({
        name: z.string(),
        privileges: z.array(
            z.object({
                action: z.string(),
                relationship: z.string(),
            })
        ),
    }),
});

export const nodeSchema: z.ZodType<Node> = baseNodeSchema.extend({
    child: z.lazy(() => z.array(nodeSchema)),
});

export function getAllPrivileges(nodes: Node[]) {
    const privileges: Omit<IPolicy, "_id">[] = [];

    function traverse(node: Node) {
        privileges.push(...node.role.privileges.map((privilege) => ({ ...privilege, isLocked: true })));
        node.child.forEach(traverse);
    }

    nodes.forEach(traverse);

    return privileges.filter(
        (privilege, index, self) =>
            self.findIndex(
                (p) => `${p.action}_${p.relationship}` === `${privilege.action}_${privilege.relationship}`
            ) === index
    );
}
