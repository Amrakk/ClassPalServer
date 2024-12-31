import { z } from "zod";
import mongooat from "../db.js";
import { ZodObjectId } from "mongooat";

const relationGroupsSchema = z.object({
    mandatory: z.array(ZodObjectId),
    optional: z.array(ZodObjectId),
});

const roleSchema = z.object({
    name: z.string(),
    isLocked: z.boolean(),
    privileges: relationGroupsSchema,
    parents: relationGroupsSchema,
});

export const roleModel = mongooat.Model("Role", roleSchema);

await roleModel.dropIndexes();
await roleModel.createIndex({ isLocked: 1 });
await roleModel.createIndex({ name: 1 }, { unique: true });
