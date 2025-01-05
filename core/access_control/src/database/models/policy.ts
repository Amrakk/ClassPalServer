import { z } from "zod";
import mongooat from "../db.js";

const policySchema = z.object({
    action: z.string(),
    relationship: z.string(),
    isLocked: z.boolean().default(false),
});

export const policyModel = mongooat.Model("Policy", policySchema);

await policyModel.dropIndexes();
await policyModel.createIndex({ action: 1 });
await policyModel.createIndex({ action: 1, relationship: 1 }, { unique: true });
