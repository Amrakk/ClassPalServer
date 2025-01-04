import { z } from "zod";
import mongooat from "../db.js";
import { ZodObjectId } from "mongooat";

export const relationGroupsSchema = z
    .object({
        mandatory: z.array(ZodObjectId),
        optional: z.array(ZodObjectId),
    })
    .default({ mandatory: [], optional: [] });

const roleSchema = z.object({
    name: z.string(),
    isLocked: z.boolean().default(false),
    privileges: relationGroupsSchema,
    parents: relationGroupsSchema,
});

export const roleModel = mongooat.Model("Role", roleSchema);

await roleModel.dropIndexes();
await roleModel.createIndex({ name: 1 }, { unique: true });
