import { z } from "zod";
import mongooat from "../db.js";
import { SUPPORTED_PARADIGM } from "../../constants.js";

const paradigmSchema = z.nativeEnum(SUPPORTED_PARADIGM);

const applicationSchema = z.object({
    name: z.string(),
    version: z.string(),
    author: z.string(),
    description: z.string(),

    verifyRequired: z.boolean().default(true),
    protocol: z.string(),
    origin: z.string(),
    basePath: z.string().default(""),
    paradigm: paradigmSchema.default(SUPPORTED_PARADIGM.REST),
});

export const ApplicationModel = mongooat.Model("Application", applicationSchema);

await ApplicationModel.dropIndexes();
await ApplicationModel.createIndex({ name: 1 }, { unique: true });
