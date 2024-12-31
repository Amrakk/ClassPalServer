import { z } from "zod";
import mongooat from "../db.js";
import { ZodObjectId } from "mongooat";

const invitationSchema = z.object({
    email: z.string().email(),
    profileId: ZodObjectId,
    senderId: ZodObjectId,
    createdAt: z
        .preprocess((val) => (typeof val === "string" ? new Date(Date.parse(val)) : val), z.date())
        .default(() => new Date()),
});

export const InvitationModel = mongooat.Model("Invitation", invitationSchema);

await InvitationModel.dropIndexes();
await InvitationModel.createIndex({ email: 1, profileId: 1 }, { unique: true });
