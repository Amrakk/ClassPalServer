import type { ClientSession } from "mongodb";
import type { ObjectId } from "mongooat";
import type { Model } from "mongooat/build/model.js";

export async function isIdsExist(
    model: Model<any, any>,
    ids: ObjectId[],
    options?: { session?: ClientSession }
): Promise<boolean> {
    return model
        .countDocuments({ _id: { $in: ids } }, { session: options?.session })
        .then((count) => count === ids.length);
}
