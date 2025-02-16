import { z } from "zod";
import mongooat from "../db.js";
import { ZodObjectId } from "mongooat";

export const relationshipSchema = z.object({
    from: ZodObjectId,
    to: ZodObjectId,
    relationship: z.string(),
});

export const relationshipModel = mongooat.Model("Relationship", relationshipSchema);

await relationshipModel.dropIndexes();
await relationshipModel.createIndex({ to: 1 });
await relationshipModel.createIndex({ from: 1 });
await relationshipModel.createIndex({ relationship: 1 });
await relationshipModel.createIndex({ from: 1, to: 1, relationship: 1 }, { unique: true });
